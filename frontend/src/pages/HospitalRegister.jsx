import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, MapPin, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCurrentPosition } from "../utils/format";
import api from "../api/axios";

const HospitalRegister = () => {
  const { registerHospital } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocationState] = useState(null);
  const [facilitiesList, setFacilitiesList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    totalBeds: "",
    availableBeds: "",
  });
  const [facilities, setFacilities] = useState([]);

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

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLocationState(pos);
      toast.success("Location captured");
    } catch {
      toast.error("Could not get your location. Please allow location access.");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      toast.error("Please set the hospital's location first");
      return;
    }
    setLoading(true);
    try {
      await registerHospital({
        ...form,
        totalBeds: Number(form.totalBeds) || 0,
        availableBeds: Number(form.availableBeds) || 0,
        facilities,
        location,
      });
      toast.success("Hospital account created!");
      navigate("/hospital/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Building2 size={22} />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">Register your hospital</h1>
          <p className="mt-1 text-sm text-ink-500">
            Help nearby accident victims find you faster by keeping availability up to date.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Hospital name</label>
              <input name="name" required className="input" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="input"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input name="phone" required className="input" value={form.phone} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input name="address" required className="input" value={form.address} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Total beds</label>
              <input type="number" min="0" name="totalBeds" required className="input" value={form.totalBeds} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Currently available beds</label>
              <input type="number" min="0" name="availableBeds" required className="input" value={form.availableBeds} onChange={handleChange} />
            </div>
          </div>

          <div className="rounded-lg border border-ink-100 bg-ink-50 p-3">
            <button type="button" onClick={handleUseLocation} className="btn-outline" disabled={locating}>
              <MapPin size={15} /> {locating ? "Detecting location..." : "Set hospital location (required)"}
            </button>
            {location && (
              <p className="mt-2 text-xs text-ink-500">
                Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
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

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <UserPlus size={16} /> {loading ? "Creating account..." : "Register hospital"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already registered?{" "}
          <Link to="/hospital/login" className="font-semibold text-primary-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalRegister;
