const StorageModule = (() => {
  const STORAGE_KEY = 'waypoint_dataset';

  const initialSeed = [
    {
      id: 'seed-1',
      title: 'Urban Flash Flood Incident',
      category: 'disaster',
      visibility: 'public',
      desc: 'Water level 40cm. Small vehicles restricted.',
      image: null,
      lat: -6.195,
      lng: 106.820,
      author: 'EmergencySystem',
      timestamp: Date.now(),
      upvotes: 8
    },
    {
      id: 'seed-2',
      title: 'Co-Working & Community Space',
      category: 'facility',
      visibility: 'public',
      desc: 'High-speed internet access available 24/7.',
      image: null,
      lat: -6.205,
      lng: 106.810,
      author: 'dev_user',
      timestamp: Date.now(),
      upvotes: 3
    }
  ];

  function getWaypoints() {
    const data = localStorage.getItem(STORAGE_KEY);
    let waypoints = data ? JSON.parse(data) : initialSeed;
    
    // Auto-Decay Logic
    const now = Date.now();
    const maxLifespanMs = CONFIG.DISASTER_LIFESPAN_HOURS * 3600 * 1000;

    waypoints = waypoints.filter(wp => {
      if (wp.category === 'disaster') {
        const age = now - wp.timestamp;
        const extendedLifespan = maxLifespanMs + ((wp.upvotes || 0) * 2 * 3600 * 1000);
        return age < extendedLifespan;
      }
      return true;
    });

    saveWaypoints(waypoints);
    return waypoints;
  }

  function saveWaypoints(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function deleteWaypoint(id) {
    let waypoints = getWaypoints();
    waypoints = waypoints.filter(wp => wp.id !== id);
    saveWaypoints(waypoints);
    return waypoints;
  }

  return { getWaypoints, saveWaypoints, deleteWaypoint };
})();