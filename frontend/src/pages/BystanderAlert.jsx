import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, MapPin, Send } from "lucide-react";
import MapView from "../components/MapView";
import api from "../api/axios";
import { getCurrentPosition } from "../utils/format";
import { DEFAULT_MAP_CENTER } from "../config";

const BystanderAlert = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ victimName: "", description: "" });

  const detectLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
    } catch {
      toast.error("Couldn't access your location. Please enable location access.");
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Please describe what happened");
      return;
    }
    if (!location) {
      toast.error("We need your location to alert nearby volunteers");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/alerts/bystander", {
        lat: location.lat,
        lng: location.lng,
        description: form.description.trim(),
        victimName: form.victimName.trim(),
      });
      toast.success(`Volunteers notified! (${res.data.volunteersNotified} nearby)`);
      navigate(`/alert/${res.data.alert._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Eye size={20} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">Report an accident</h1>
            <p className="text-sm text-ink-500">Saw something happen? Let nearby volunteers and hospitals know.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Victim's name (if known)</label>
            <input
              name="victimName"
              className="input"
              placeholder="Optional"
              value={form.victimName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">What happened? *</label>
            <textarea
              name="description"
              required
              rows={4}
              className="input resize-none"
              placeholder="e.g. Two-wheeler accident near the main road, one person injured and conscious, needs medical attention."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="rounded-lg border border-ink-100 bg-ink-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-700">Accident location</p>
              <button type="button" onClick={detectLocation} className="btn-outline px-2.5 py-1.5 text-xs" disabled={locating}>
                <MapPin size={13} /> {locating ? "Detecting..." : "Re-detect location"}
              </button>
            </div>
            <div className="mt-3">
              <MapView
                center={location || DEFAULT_MAP_CENTER}
                zoom={14}
                height="220px"
                markers={location ? [{ lat: location.lat, lng: location.lng, type: "alert", popup: "Accident location" }] : []}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">
              We use your current device location as the accident location. Make sure you're at (or near) the scene.
            </p>
          </div>

          <button type="submit" className="btn-danger w-full" disabled={submitting}>
            <Send size={16} /> {submitting ? "Notifying volunteers..." : "Submit report & alert volunteers"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BystanderAlert;
