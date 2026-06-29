import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, authType, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only logged-in regular users (potential volunteers / reporters)
    // need a realtime connection. Hospitals don't need sockets for now.
    if (!isAuthenticated || authType !== "user" || !user?._id) {
      setSocket((current) => {
        if (current) current.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const s = io(API_URL, { transports: ["websocket", "polling"] });

    s.on("connect", () => {
      setConnected(true);
      s.emit("register", user._id);
    });

    s.on("disconnect", () => setConnected(false));

    // A new SOS / accident alert is near this volunteer
    s.on("new-alert", (data) => {
      setUnreadCount((c) => c + 1);
      toast(data?.notification?.title || "New nearby emergency alert", { icon: "🚨" });
    });

    // The reporter is told a volunteer accepted their alert
    s.on("alert-accepted", (data) => {
      toast.success(data?.notification?.message || "A volunteer is on the way!");
    });

    // Other volunteers are told the alert has been handled
    s.on("alert-taken", () => {
      toast("That alert has already been handled by another volunteer.", { icon: "✅" });
    });

    // The reporter is told the search radius has grown
    s.on("radius-expanded", (data) => {
      toast(data?.notification?.message || "Search radius expanded - still looking for a volunteer.", {
        icon: "📡",
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authType, user?._id]);

  const resetUnread = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, connected, unreadCount, resetUnread }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
