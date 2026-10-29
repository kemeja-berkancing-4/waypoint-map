const app = (() => {
  let currentUser = null;
  let currentMode = 'navigate';
  let pendingLatLng = null;
  let waypoints = [];

  function init() {
    MapModule.initMap('map');
    waypoints = StorageModule.getWaypoints();
    bindEvents();
    refresh();
  }

  function bindEvents() {
    const map = MapModule.getInstance();

    map.on('click', (e) => {
      if (currentMode !== 'add') return;
      pendingLatLng = e.latlng;
      document.getElementById('waypoint-modal').classList.remove('hidden');
    });

    document.getElementById('mode-navigate').onclick = () => setMode('navigate');
    document.getElementById('mode-add').onclick = () => setMode('add');

    document.getElementById('close-modal-btn').onclick = closeModal;
    document.getElementById('cancel-modal-btn').onclick = closeModal;

    document.getElementById('waypoint-form').onsubmit = handleFormSubmit;
    document.getElementById('auth-btn').onclick = toggleAuth;

    document.getElementById('filter-public').onchange = refresh;
    document.getElementById('filter-private').onchange = refresh;
    document.getElementById('filter-disaster').onchange = refresh;

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
  }

  function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (navigator.onLine) {
      statusEl.className = 'text-emerald-400 flex items-center gap-1';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Online';
    } else {
      statusEl.className = 'text-amber-400 flex items-center gap-1';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Offline (PWA Cache)';
    }
  }

  function setMode(mode) {
    currentMode = mode;
    const btnNav = document.getElementById('mode-navigate');
    const btnAdd = document.getElementById('mode-add');
    const hint = document.getElementById('mode-hint');

    if (mode === 'navigate') {
      btnNav.classList.add('active');
      btnAdd.classList.remove('active');
      hint.innerText = 'Click and drag map to navigate.';
    } else {
      btnAdd.classList.add('active');
      btnNav.classList.remove('active');
      hint.innerText = 'Click anywhere on the map to place a new marker.';
    }
  }

  function closeModal() {
    document.getElementById('waypoint-modal').classList.add('hidden');
    pendingLatLng = null;
    document.getElementById('waypoint-form').reset();
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!pendingLatLng) return;

    const title = document.getElementById('wp-title').value;
    const category = document.getElementById('wp-category').value;
    const visibility = document.getElementById('wp-visibility').value;
    const desc = document.getElementById('wp-desc').value;
    const imageFile = document.getElementById('wp-image').files[0];

    if (visibility === 'private' && !currentUser) {
      alert('Authentication required to save Private markers.');
      return;
    }

    let imageDataBase64 = null;
    if (imageFile) {
      imageDataBase64 = await convertBase64(imageFile);
    }

    const newWp = {
      id: 'wp-' + Date.now(),
      title,
      category,
      visibility,
      desc,
      image: imageDataBase64,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      author: currentUser ? currentUser.username : 'Anonymous',
      timestamp: Date.now(),
      upvotes: 0
    };

    waypoints.push(newWp);
    StorageModule.saveWaypoints(waypoints);
    
    closeModal();
    setMode('navigate');
    refresh();
  }

  function convertBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  }

  function toggleAuth() {
    const userBadge = document.getElementById('user-badge');
    const statusText = document.getElementById('login-status-text');
    const authBtn = document.getElementById('auth-btn');

    if (currentUser) {
      currentUser = null;
      userBadge.innerText = 'Guest';
      userBadge.className = 'px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium border border-slate-700';
      statusText.innerText = 'Unauthenticated Session';
      authBtn.innerText = 'Toggle Session';
    } else {
      currentUser = { username: 'alex_explorer' };
      userBadge.innerText = 'alex_explorer';
      userBadge.className = 'px-2.5 py-1 bg-brand-900/60 text-brand-300 rounded-md text-xs font-medium border border-brand-700';
      statusText.innerText = 'Logged in as: alex_explorer';
      authBtn.innerText = 'Logout';
    }
    refresh();
  }

  function upvote(id) {
    const wp = waypoints.find(item => item.id === id);
    if (wp) {
      wp.upvotes = (wp.upvotes || 0) + 1;
      StorageModule.saveWaypoints(waypoints);
      refresh();
    }
  }

  function deleteMarker(id) {
    if (confirm('Are you sure you want to delete this marker?')) {
      waypoints = StorageModule.deleteWaypoint(id);
      refresh();
    }
  }

  function refresh() {
    const filters = {
      public: document.getElementById('filter-public').checked,
      private: document.getElementById('filter-private').checked,
      disaster: document.getElementById('filter-disaster').checked
    };

    MapModule.renderMarkers(waypoints, currentUser, filters);
    renderList();
  }

  function renderList() {
    const listEl = document.getElementById('waypoint-list');
    const countEl = document.getElementById('waypoint-count');
    listEl.innerHTML = '';

    const visible = waypoints.filter(wp => {
      if (wp.visibility === 'private' && (!currentUser || wp.author !== currentUser.username)) {
        return false;
      }
      return true;
    });

    countEl.innerText = visible.length;

    if (visible.length === 0) {
      listEl.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No active markers.</p>`;
      return;
    }

    visible.forEach(wp => {
      const catConfig = CONFIG.CATEGORIES[wp.category];
      const item = document.createElement('div');
      item.className = 'p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg cursor-pointer transition flex items-center justify-between group';
      item.innerHTML = `
        <div class="overflow-hidden pr-2 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="w-2 h-2 rounded-full ${catConfig.bgClass}"></span>
            <h5 class="text-xs font-semibold text-slate-200 truncate">${wp.title}</h5>
          </div>
          <p class="text-[11px] text-slate-400 truncate">${wp.desc || 'No description'}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[10px] text-slate-500">${wp.visibility}</span>
          <button onclick="event.stopPropagation(); app.deleteMarker('${wp.id}')" class="text-slate-500 hover:text-rose-400 text-xs p-1">✕</button>
        </div>
      `;
      item.onclick = () => {
        MapModule.getInstance().flyTo([wp.lat, wp.lng], 15, { duration: 1.2 });
      };
      listEl.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { upvote, deleteMarker };
})();