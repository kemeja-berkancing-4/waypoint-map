const CONFIG = {
  DEFAULT_MAP_CENTER: [-6.200000, 106.816666], // Jakarta
  DEFAULT_ZOOM: 12,
  
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  
  // Auto-Decay Config (Disaster markers expire in 24 hours unless upvoted)
  DISASTER_LIFESPAN_HOURS: 24,

  CATEGORIES: {
    facility: { label: 'Facility / Shop', color: '#10b981', bgClass: 'bg-emerald-500' },
    hiddengem: { label: 'Hidden Gem', color: '#0284c7', bgClass: 'bg-sky-500' },
    disaster: { label: 'Crisis (Auto-Decay)', color: '#f43f5e', bgClass: 'bg-rose-500' },
    shelter: { label: 'Shelter Area', color: '#eab308', bgClass: 'bg-amber-500' }
  }
};