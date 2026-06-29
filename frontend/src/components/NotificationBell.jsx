import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";
import { timeAgo } from "../utils/format";

const NotificationBell = () => {
  const { socket, unreadCount, resetUnread } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/volunteer/notifications");
      setNotifications(res.data);
    } catch {
      /* ignore - bell is non-critical */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchNotifications();
    socket.on("new-alert", refresh);
    socket.on("alert-accepted", refresh);
    socket.on("alert-taken", refresh);
    socket.on("radius-expanded", refresh);
    return () => {
      socket.off("new-alert", refresh);
      socket.off("alert-accepted", refresh);
      socket.off("alert-taken", refresh);
      socket.off("radius-expanded", refresh);
    };
  }, [socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      resetUnread();
      try {
        await api.put("/volunteer/notifications/read-all");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={toggleOpen} className="relative rounded-full p-2 hover:bg-ink-100" aria-label="Notifications">
        <Bell size={20} className="text-ink-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emergency-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="thin-scrollbar absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-ink-100 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-ink-100 bg-white px-4 py-2 font-display text-sm font-semibold text-ink-700">
            Notifications
          </div>
          {loading && <div className="p-4 text-sm text-ink-400">Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div className="p-4 text-sm text-ink-400">You're all caught up. No notifications yet.</div>
          )}
          {notifications.map((n) => (
            <div key={n._id} className="border-b border-ink-50 px-4 py-3 text-sm hover:bg-ink-50">
              <p className="font-medium text-ink-800">{n.title}</p>
              <p className="mt-0.5 text-ink-500">{n.message}</p>
              <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
