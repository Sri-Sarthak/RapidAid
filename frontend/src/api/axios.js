import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach the JWT (if present) to every request.
// AuthContext stores the auth bundle under "authData" in localStorage:
//   { token, type: "user" | "hospital", profile: {...} }
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("authData");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore malformed storage */
    }
  }
  return config;
});

export default api;
