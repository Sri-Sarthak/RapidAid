import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Siren, Eye, Radar, CheckCircle2, Phone, MapPin, ExternalLink } from "lucide-react";
import MapView from "../components/MapView";
import HospitalCard from "../components/HospitalCard";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { timeAgo, mapsLink } from "../utils/format";

const statusStyles = {
  pending: { label: "Searching for a volunteer", className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Volunteer is on the way", className: "bg-primary-100 text-primary-700" },
  resolved: { label: "Resolved", className: "bg-ink-100 text-ink-600" },
  cancelled: { label: "Cancelled", className: "bg-ink-100 text-ink-600" },
};

const AlertStatus = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  const fetchAlert = async () => {
    try {
      const res = await api.get(`/sos/${id}`);
      setAlert(res.data);
    } catch {
      toast.error("Could not load this alert");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const refresh = (data) => {
      if (data?.alertId === id) fetchAlert();
    };
    socket.on("alert-accepted", refresh);
    socket.on("radius-expanded", refresh);
    return () => {
      socket.off("alert-accepted", refresh);
      socket.off("radius-expanded", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await api.put(`/sos/${id}/resolve`);
      setAlert(res.data);
      toast.success("Marked as resolved. Stay safe!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resolve alert");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-ink-500">Alert not found.</p>
        <Link to="/dashboard" className="btn-primary mt-4">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const [lng, lat] = alert.location.coordinates;
  const status = statusStyles[alert.status] || statusStyles.pending;
  const isSOS = alert.type === "sos";

  const markers = [{ lat, lng, type: "alert", popup: "Alert location" }];
  if (alert.acceptedBy?.location?.coordinates) {
    const [vLng, vLat] = alert.acceptedBy.location.coordinates;
    markers.push({ lat: vLat, lng: vLng, type: "volunteer", popup: `${alert.acceptedBy.name} (volunteer)` });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emergency-100 text-emergency-600">
              {isSOS ? <Siren size={20} /> : <Eye size={20} />}
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900">
                {isSOS ? "SOS Alert" : "Accident Report"}
              </h1>
              <p className="text-xs text-ink-500">Raised {timeAgo(alert.createdAt)}</p>
            </div>
          </div>
          <span className={`badge text-sm ${status.className}`}>{status.label}</span>
        </div>

        {alert.description && <p className="mt-3 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">{alert.description}</p>}

        {/* Pending state */}
        {alert.status === "pending" && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <Radar size={18} className="shrink-0 animate-pulse" />
            <p>
              Searching for available volunteers within{" "}
              <span className="font-semibold">{alert.currentRadiusKm} km</span>. If no one responds, the search
              radius will automatically expand.
            </p>
          </div>
        )}

        {/* Accepted state */}
        {alert.status === "accepted" && alert.acceptedBy && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <p>
                <span className="font-semibold">{alert.acceptedBy.name}</span> has accepted your alert and is on the
                way.
              </p>
            </div>
            <a href={`tel:${alert.acceptedBy.phone}`} className="btn-primary px-3 py-1.5 text-xs">
              <Phone size={13} /> Call {alert.acceptedBy.phone}
            </a>
          </div>
        )}

        {alert.status === "resolved" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm text-ink-600">
            <CheckCircle2 size={18} /> This alert has been marked as resolved.
          </div>
        )}

        <div className="mt-4">
          <MapView center={{ lat, lng }} zoom={13} height="260px" markers={markers} circle={{ lat, lng, radiusKm: alert.currentRadiusKm }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <a href={mapsLink(lat, lng)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:underline">
            <MapPin size={14} /> Open location in Google Maps <ExternalLink size={12} />
          </a>
          {alert.familyNotified?.length > 0 && (
            <span className="text-ink-500">Family notified: {alert.familyNotified.join(", ")}</span>
          )}
        </div>

        {(alert.status === "pending" || alert.status === "accepted") && String(alert.reportedBy) === String(user?._id) && (
          <div className="mt-5">
            <button onClick={handleResolve} className="btn-outline" disabled={resolving}>
              <CheckCircle2 size={15} /> {resolving ? "Updating..." : "Mark as resolved"}
            </button>
          </div>
        )}
      </div>

      {/* Nearby hospitals snapshot */}
      {alert.nearbyHospitals?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-800">Nearby hospitals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alert.nearbyHospitals.map((h) => (
              <HospitalCard key={h._id} hospital={h} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertStatus;
