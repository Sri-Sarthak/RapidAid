import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HeartHandshake, Radar, ToggleLeft, ToggleRight, Siren, Eye, CheckCircle2 } from "lucide-react";
import AlertCard from "../components/AlertCard";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getCurrentPosition, timeAgo, haversineDistanceKm } from "../utils/format";

const VolunteerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [available, setAvailable] = useState(!!user?.volunteerAvailable);
  const [toggling, setToggling] = useState(false);
  const [location, setLocation] = useState(
    user?.location?.coordinates?.length === 2 && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0)
      ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] }
      : null
  );

  const [incomingAlerts, setIncomingAlerts] = useState([]); // [{ alert, distanceKm }]
  const [acceptedAlerts, setAcceptedAlerts] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [loading, setLoading] = useState(true);

  const alertDistance = (alert, loc) => {
    if (!loc) return undefined;
    const [lng, lat] = alert.location.coordinates;
    return haversineDistanceKm(loc, { lat, lng });
  };

  const loadData = async (loc = location) => {
    setLoading(true);
    try {
      const [notifRes, acceptedRes] = await Promise.all([
        api.get("/volunteer/notifications"),
        api.get("/volunteer/alerts/accepted"),
      ]);

      // Build incoming alert list from "sos_alert" notifications whose alert is still pending
      const pending = [];
      const seen = new Set();
      for (const n of notifRes.data) {
        if (n.type === "sos_alert" && n.alert && n.alert.status === "pending" && !seen.has(n.alert._id)) {
          seen.add(n.alert._id);
          pending.push({ alert: n.alert, distanceKm: alertDistance(n.alert, loc) });
        }
      }
      setIncomingAlerts(pending);
      setAcceptedAlerts(acceptedRes.data.filter((a) => a.status === "accepted"));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNewAlert = (data) => {
      if (!data?.alert?._id) return;
      setIncomingAlerts((list) => {
        if (list.some((item) => item.alert._id === data.alert._id)) return list;
        return [{ alert: data.alert, distanceKm: data.distanceKm }, ...list];
      });
    };

    const onAlertTaken = (data) => {
      setIncomingAlerts((list) => list.filter((item) => item.alert._id !== data.alertId));
    };

    socket.on("new-alert", onNewAlert);
    socket.on("alert-taken", onAlertTaken);
    return () => {
      socket.off("new-alert", onNewAlert);
      socket.off("alert-taken", onAlertTaken);
    };
  }, [socket]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      let pos = location;
      if (!available) {
        // Turning ON - refresh location
        pos = await getCurrentPosition().catch(() => location);
        if (pos) setLocation(pos);
      }

      const res = await api.put("/volunteer/availability", {
        available: !available,
        ...(pos ? { lat: pos.lat, lng: pos.lng } : {}),
      });

      setAvailable(res.data.volunteerAvailable);
      updateProfile({ ...user, volunteerAvailable: res.data.volunteerAvailable, location: res.data.location });
      toast.success(res.data.volunteerAvailable ? "You're now visible to nearby emergencies" : "You're offline");

      if (!available) loadData(pos);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update availability");
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (alertId) => {
    setAccepting(alertId);
    try {
      await api.post(`/volunteer/alerts/${alertId}/accept`);
      toast.success("You accepted the alert. Head to the location now!");
      setIncomingAlerts((list) => list.filter((item) => item.alert._id !== alertId));
      navigate(`/alert/${alertId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not accept this alert");
      loadData();
    } finally {
      setAccepting(null);
    }
  };

  if (!user?.isVolunteer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <HeartHandshake size={26} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Become a volunteer</h1>
        <p className="mt-2 text-ink-500">
          Opt in as a volunteer from your profile to start receiving nearby emergency alerts and help people in
          need.
        </p>
        <Link to="/profile" className="btn-primary mt-5">
          Go to profile
        </Link>
      </div>
    );
  }

  const markers = [];
  if (location) markers.push({ lat: location.lat, lng: location.lng, type: "volunteer", popup: "You" });
  incomingAlerts.forEach(({ alert }) => {
    const [lng, lat] = alert.location.coordinates;
    markers.push({ lat, lng, type: "alert", popup: alert.description || "Alert" });
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Volunteer Hub</h1>
          <p className="mt-1 text-sm text-ink-500">Toggle your availability to start receiving nearby alerts.</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            available ? "bg-primary-600 text-white" : "bg-ink-100 text-ink-600"
          }`}
        >
          {available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          {toggling ? "Updating..." : available ? "Available for help" : "Currently offline"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MapView center={location} zoom={12} height="320px" markers={markers} />
          {!location && (
            <p className="mt-2 text-xs text-ink-400">
              Turn on availability to share your location - this helps match you with nearby alerts.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Radar size={18} className="text-emergency-600" />
            <h2 className="font-display text-lg font-semibold text-ink-800">Nearby alerts</h2>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          )}

          {!loading && incomingAlerts.length === 0 && (
            <div className="card p-6 text-center text-sm text-ink-500">
              {available
                ? "No active alerts near you right now. We'll notify you instantly when something happens."
                : "Go online to start receiving alerts from people near you."}
            </div>
          )}

          <div className="space-y-3">
            {incomingAlerts.map(({ alert, distanceKm }) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                distanceKm={distanceKm}
                onAccept={handleAccept}
                accepting={accepting === alert._id}
              />
            ))}
          </div>

          {/* Accepted alerts */}
          {acceptedAlerts.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary-600" />
                <h2 className="font-display text-lg font-semibold text-ink-800">You're helping with</h2>
              </div>
              <div className="space-y-2">
                {acceptedAlerts.map((alert) => (
                  <Link
                    key={alert._id}
                    to={`/alert/${alert._id}`}
                    className="card flex items-center justify-between gap-3 p-3 hover:border-primary-200"
                  >
                    <div className="flex items-center gap-2">
                      {alert.type === "sos" ? (
                        <Siren size={16} className="text-emergency-600" />
                      ) : (
                        <Eye size={16} className="text-emergency-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink-800">
                          {alert.reportedBy?.name || "Reporter"} - {alert.description || "Accident"}
                        </p>
                        <p className="text-xs text-ink-400">{timeAgo(alert.createdAt)}</p>
                      </div>
                    </div>
                    <span className="badge bg-primary-100 text-primary-700">View</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
