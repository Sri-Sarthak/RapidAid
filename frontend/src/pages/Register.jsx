import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Siren, UserPlus, Plus, Trash2, MapPin, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCurrentPosition } from "../utils/format";

const emptyFamilyMember = () => ({ name: "", relation: "", phone: "", email: "" });

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocationState] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    isVolunteer: false,
    volunteerSkills: "",
  });

  const [familyMembers, setFamilyMembers] = useState([emptyFamilyMember()]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFamilyMembers((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addFamilyMember = () => setFamilyMembers((rows) => [...rows, emptyFamilyMember()]);
  const removeFamilyMember = (index) => setFamilyMembers((rows) => rows.filter((_, i) => i !== index));

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLocationState(pos);
      toast.success("Location captured");
    } catch {
      toast.error("Could not get your location. You can still sign up.");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        volunteerSkills: form.volunteerSkills
          ? form.volunteerSkills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        familyMembers: familyMembers.filter((m) => m.name.trim() && m.phone.trim()),
        location: location || undefined,
      };
      await registerUser(payload);
      toast.success("Account created! Welcome to RapidAid.");
      navigate("/dashboard");
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
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emergency-600 text-white">
            <Siren size={22} />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">
            Add a few emergency contacts now so help can reach them instantly later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="input" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input name="phone" required className="input" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email address</label>
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
          </div>

          {/* Location */}
          <div className="rounded-lg border border-ink-100 bg-ink-50 p-3">
            <button type="button" onClick={handleUseLocation} className="btn-outline" disabled={locating}>
              <MapPin size={15} /> {locating ? "Detecting location..." : "Use my current location"}
            </button>
            {location && (
              <p className="mt-2 text-xs text-ink-500">
                Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
            {!location && (
              <p className="mt-2 text-xs text-ink-400">
                Optional now - we'll ask again whenever you press SOS or toggle volunteer availability.
              </p>
            )}
          </div>

          {/* Family members */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Emergency / family contacts</label>
              <button type="button" onClick={addFamilyMember} className="btn-outline px-2 py-1 text-xs">
                <Plus size={13} /> Add contact
              </button>
            </div>
            <div className="space-y-3">
              {familyMembers.map((fm, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-ink-100 p-3 sm:grid-cols-12">
                  <input
                    className="input sm:col-span-3"
                    placeholder="Name"
                    value={fm.name}
                    onChange={(e) => updateFamilyMember(i, "name", e.target.value)}
                  />
                  <input
                    className="input sm:col-span-2"
                    placeholder="Relation"
                    value={fm.relation}
                    onChange={(e) => updateFamilyMember(i, "relation", e.target.value)}
                  />
                  <input
                    className="input sm:col-span-3"
                    placeholder="Phone"
                    value={fm.phone}
                    onChange={(e) => updateFamilyMember(i, "phone", e.target.value)}
                  />
                  <input
                    className="input sm:col-span-3"
                    placeholder="Email (for SOS alerts)"
                    value={fm.email}
                    onChange={(e) => updateFamilyMember(i, "email", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(i)}
                    className="flex items-center justify-center rounded-lg border border-ink-100 text-ink-400 hover:bg-emergency-50 hover:text-emergency-600 sm:col-span-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Add an email for each contact you want to receive your SOS message and live location link.
            </p>
          </div>

          {/* Volunteer opt-in */}
          <div className="rounded-lg border border-primary-100 bg-primary-50 p-3">
            <label className="flex items-start gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                name="isVolunteer"
                checked={form.isVolunteer}
                onChange={handleChange}
                className="mt-0.5"
              />
              <span>
                <span className="flex items-center gap-1.5 font-medium text-primary-700">
                  <HeartHandshake size={15} /> I want to be a volunteer
                </span>
                I'll receive alerts about accidents near me and can choose to help.
              </span>
            </label>
            {form.isVolunteer && (
              <div className="mt-3">
                <label className="label">Skills (comma separated, optional)</label>
                <input
                  name="volunteerSkills"
                  className="input"
                  placeholder="First aid, CPR, Driving, Medical student"
                  value={form.volunteerSkills}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <UserPlus size={16} /> {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
