import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, BedDouble, Save, MapPin } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";

const HospitalDashboard = () => {
  const { hospital, updateProfile } = useAuth();
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    totalBeds: hospital?.totalBeds ?? 0,
    availableBeds: hospital?.availableBeds ?? 0,
    address: hospital?.address || "",
  });
  const [facilities, setFacilities] = useState(hospital?.facilities || []);

  useEffect(() => {
    api
      .get("/hospitals/facilities-list")
      .then((res) => setFacilitiesList(res.data))
      .catch(() => setFacilitiesList([]));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleFacility = (f) => {
    setFacilities((list) => (list.includes(f) ? list.filter((x) => x !== f) : [...list, f]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.availableBeds) > Number(form.totalBeds)) {
      toast.error("Available beds can't be more than total beds");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put("/hospitals/availability", {
        totalBeds: Number(form.totalBeds),
        availableBeds: Number(form.availableBeds),
        address: form.address,
        facilities,
      });
      updateProfile(res.data);
      toast.success("Availability updated - changes are live for nearby users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update");
    } finally {
      setSaving(false);
    }
  };

  const occupancy =
    form.totalBeds > 0 ? Math.round(((form.totalBeds - form.availableBeds) / form.totalBeds) * 100) : 0;
  const [lng, lat] = hospital?.location?.coordinates || [0, 0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Building2 size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{hospital?.name}</h1>
          <p className="flex items-center gap-1 text-sm text-ink-500">
            <MapPin size={13} /> {hospital?.address}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-400">Total beds</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-800">{form.totalBeds}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-400">Available now</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary-600">{form.availableBeds}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-400">Occupancy</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-800">{occupancy}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
            <BedDouble size={18} className="text-primary-600" /> Update availability
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Total beds</label>
                <input type="number" min="0" name="totalBeds" className="input" value={form.totalBeds} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Available beds</label>
                <input type="number" min="0" name="availableBeds" className="input" value={form.availableBeds} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input name="address" className="input" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label">Facilities available</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {facilitiesList.map((f) => (
                  <label
                    key={f}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      facilities.includes(f)
                        ? "border-primary-300 bg-primary-50 text-primary-700"
                        : "border-ink-100 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    <input type="checkbox" className="hidden" checked={facilities.includes(f)} onChange={() => toggleFacility(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-800">Location</h2>
          <MapView
            center={{ lat, lng }}
            zoom={14}
            height="260px"
            markers={[{ lat, lng, type: "hospital", popup: hospital?.name }]}
          />
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
