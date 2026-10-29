const MapModule = (() => {
  let mapInstance = null;
  let markerLayerGroup = null;

  function initMap(containerId) {
    mapInstance = L.map(containerId, { zoomControl: false }).setView(
      CONFIG.DEFAULT_MAP_CENTER,
      CONFIG.DEFAULT_ZOOM
    );

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    L.tileLayer(CONFIG.TILE_LAYER_URL, {
      attribution: CONFIG.TILE_ATTRIBUTION,
      maxZoom: 19
    }).addTo(mapInstance);

    markerLayerGroup = L.layerGroup().addTo(mapInstance);

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);
  }

  function renderMarkers(waypoints, currentUser, filters) {
    if (!markerLayerGroup) return;
    markerLayerGroup.clearLayers();

    waypoints.forEach(wp => {
      if (wp.category === 'disaster' && !filters.disaster) return;
      if (wp.visibility === 'public' && wp.category !== 'disaster' && !filters.public) return;
      if (wp.visibility === 'private') {
        if (!filters.private) return;
        if (!currentUser || wp.author !== currentUser.username) return;
      }

      const catConfig = CONFIG.CATEGORIES[wp.category] || CONFIG.CATEGORIES.facility;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="custom-marker-pin" style="background-color: ${catConfig.color}"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon });

      const imageHTML = wp.image 
        ? `<div class="mt-2 rounded-lg overflow-hidden border border-slate-800 max-h-36"><img src="${wp.image}" class="w-full h-auto object-cover" /></div>` 
        : '';

      let actionButtonHTML = '';
      if (wp.category === 'disaster') {
        const hoursLeft = Math.max(0, Math.round((CONFIG.DISASTER_LIFESPAN_HOURS * 3600 * 1000 - (Date.now() - wp.timestamp)) / 3600000));
        actionButtonHTML = `
          <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-rose-400 font-mono">⏳ ~${hoursLeft}h left</span>
            <button onclick="app.upvote('${wp.id}')" class="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded font-medium transition">
              👍 Verify (${wp.upvotes || 0})
            </button>
          </div>
        `;
      }

      // Allow deletion if public or owned by current user
      const isOwner = wp.visibility === 'public' || (currentUser && wp.author === currentUser.username);
      const deleteButtonHTML = isOwner ? `
        <button onclick="app.deleteMarker('${wp.id}')" class="text-xs text-rose-400 hover:text-rose-300 underline font-medium">
          Delete Pin
        </button>
      ` : '';

      const popupHTML = `
        <div class="p-2 max-w-xs font-sans">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded text-white ${catConfig.bgClass}">
              ${catConfig.label}
            </span>
            <span class="text-[10px] text-slate-400">
              ${wp.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
            </span>
          </div>
          <h4 class="font-bold text-sm text-slate-100">${wp.title}</h4>
          ${imageHTML}
          <p class="text-xs text-slate-300 mt-2">${wp.desc || 'No description provided.'}</p>
          <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>By: <strong class="text-slate-200">${wp.author}</strong></span>
            ${deleteButtonHTML}
          </div>
          ${actionButtonHTML}
        </div>
      `;

      marker.bindPopup(popupHTML);
      markerLayerGroup.addLayer(marker);
    });
  }

  function getInstance() {
    return mapInstance;
  }

  return { initMap, renderMarkers, getInstance };
})(); 