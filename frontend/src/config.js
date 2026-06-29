// Backend API + Socket.IO base URL. Override via VITE_API_URL in a .env file.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Default map center used before the browser's geolocation resolves
// (Varanasi, India) - purely a fallback for the map view.
export const DEFAULT_MAP_CENTER = { lat: 25.3176, lng: 82.9739 };
