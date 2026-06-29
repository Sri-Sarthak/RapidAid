import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const STORAGE_KEY = "authData";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(readStoredAuth);
  const [loading, setLoading] = useState(true);

  const persist = (data) => {
    setAuthData(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // On first load, verify the stored token is still valid and refresh the profile
  useEffect(() => {
    const init = async () => {
      const stored = readStoredAuth();
      if (!stored?.token) {
        setLoading(false);
        return;
      }

      try {
        const endpoint = stored.type === "hospital" ? "/hospitals/me" : "/auth/me";
        const res = await api.get(endpoint);
        const profile = stored.type === "hospital" ? res.data : res.data;
        persist({ ...stored, profile });
      } catch {
        persist(null);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    persist({ token: res.data.token, type: "user", profile: res.data.user });
    return res.data.user;
  };

  const registerUser = async (payload) => {
    const res = await api.post("/auth/register", payload);
    persist({ token: res.data.token, type: "user", profile: res.data.user });
    return res.data.user;
  };

  const loginHospital = async (email, password) => {
    const res = await api.post("/hospitals/login", { email, password });
    persist({ token: res.data.token, type: "hospital", profile: res.data.hospital });
    return res.data.hospital;
  };

  const registerHospital = async (payload) => {
    const res = await api.post("/hospitals/register", payload);
    persist({ token: res.data.token, type: "hospital", profile: res.data.hospital });
    return res.data.hospital;
  };

  const updateProfile = (profile) => {
    persist({ ...authData, profile });
  };

  const logout = () => persist(null);

  const value = {
    authType: authData?.type || null,
    user: authData?.type === "user" ? authData.profile : null,
    hospital: authData?.type === "hospital" ? authData.profile : null,
    isAuthenticated: !!authData?.token,
    loading,
    loginUser,
    registerUser,
    loginHospital,
    registerHospital,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
