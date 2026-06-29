import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Hospital, Eye, RefreshCw } from "lucide-react";
import SOSButton from "../components/SOSButton";
import HospitalCard from "../components/HospitalCard";
import LoadingSpinner from "../components/LoadingSpinner";
import MapView from "../components/MapView";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getCurrentPosition, timeAgo } from "../utils/format";
import { DEFAULT_MAP_CENTER } from "../config";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [activeAlert, setActiveAlert] = useState(undefined); // undefined = loading, null = none
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const loadActiveAlert = async () => {
    try {
      const res = await api.get("/sos/active");
      setActiveAlert(res.data);
    } catch {
      setActiveAlert(null);
    }
  };

  const loadHospitals = async (loc) => {
    setLoadingHospitals(true);
    try {
      const res = await api.get("/hospitals/nearby", { params: { lat: loc.lat, lng: loc.lng } });
      setHospitals(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    loadActiveAlert();
    (async () => {
      try {
        const pos = await getCurrentPosition();
        setLocation(pos);
        loadHospitals(pos);
      } catch {
        setLocation(DEFAULT_MAP_CENTER);
        loadHospitals(DEFAULT_MAP_CENTER);
        toast.error("Couldn't access your location. Showing hospitals near a default area.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSOS = async () => {
    setTriggering(true);
    try {
      const pos = await getCurrentPosition().catch(() => location || DEFAULT_MAP_CENTER);
      const res = await api.post("/sos/trigger", { lat: pos.lat, lng: pos.lng });
      toast.success("SOS sent! Family and nearby volunteers have been alerted.");
      navigate(`/alert/${res.data.alert._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send SOS. Please try again.");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Hi {user?.name?.split(" ")[0]}, stay safe.</h1>
      <p className="mt-1 text-sm text-ink-500">
        In an emergency, press and hold the SOS button below. It's that simple.
      </p>

      {/* Active alert banner */}
      {activeAlert && (
        <div className="mt-5 card flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-emergency-500 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-emergency-600" size={22} />
            <div>
              <p className="font-semibold text-ink-800">
                You have an active alert ({activeAlert.status === "accepted" ? "volunteer found" : "searching for volunteers"})
              </p>
              <p className="text-xs text-ink-500">Raised {timeAgo(activeAlert.createdAt)}</p>
            </div>
          </div>
          <Link to={`/alert/${activeAlert._id}`} className="btn-primary">
            View status
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* SOS button */}
        <div className="card flex flex-col items-center justify-center p-8 lg:col-span-1">
          <SOSButton onConfirm={handleSOS} loading={triggering} />
        </div>

        {/* Map + quick actions */}
        <div className="space-y-4 lg:col-span-2">
          <MapView
            center={location}
            zoom={13}
            height="220px"
            markers={location ? [{ lat: location.lat, lng: location.lng, type: "user", popup: "Your current location" }] : []}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/report" className="card flex items-center gap-3 p-4 hover:border-primary-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Eye size={18} />
              </span>
              <div>
                <p className="font-semibold text-ink-800">Report an accident</p>
                <p className="text-xs text-ink-500">Saw something happen? Alert volunteers on the victim's behalf.</p>
              </div>
            </Link>
            <Link to="/volunteer" className="card flex items-center gap-3 p-4 hover:border-primary-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Hospital size={18} />
              </span>
              <div>
                <p className="font-semibold text-ink-800">Volunteer Hub</p>
                <p className="text-xs text-ink-500">Go online to receive nearby emergency alerts and help.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Nearby hospitals */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-800">Hospitals near you</h2>
          <button
            className="btn-outline px-2.5 py-1.5 text-xs"
            onClick={() => location && loadHospitals(location)}
            disabled={loadingHospitals}
          >
            <RefreshCw size={13} className={loadingHospitals ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        {loadingHospitals && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        {!loadingHospitals && hospitals.length === 0 && (
          <p className="text-sm text-ink-400">No hospitals found nearby yet. Try seeding sample data on the backend.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h) => (
            <HospitalCard key={h._id} hospital={h} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
