import { useState } from "react";
import toast from "react-hot-toast";
import { Save, Plus, Trash2, HeartHandshake, UserCircle2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyFamilyMember = () => ({ name: "", relation: "", phone: "", email: "" });

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    isVolunteer: !!user?.isVolunteer,
    volunteerSkills: (user?.volunteerSkills || []).join(", "),
  });

  const [familyMembers, setFamilyMembers] = useState(
    user?.familyMembers?.length ? user.familyMembers.map((m) => ({ ...m })) : [emptyFamilyMember()]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFamilyMembers((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addFamilyMember = () => setFamilyMembers((rows) => [...rows, emptyFamilyMember()]);
  const removeFamilyMember = (index) => setFamilyMembers((rows) => rows.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        isVolunteer: form.isVolunteer,
        volunteerSkills: form.volunteerSkills
          ? form.volunteerSkills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        familyMembers: familyMembers.filter((m) => m.name.trim() && m.phone.trim()),
      };
      const res = await api.put("/auth/profile", payload);
      updateProfile(res.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <UserCircle2 size={22} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">Your profile</h1>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="input" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input name="phone" required className="input" value={form.phone} onChange={handleChange} />
            </div>
          </div>

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
          </div>

          <div className="rounded-lg border border-primary-100 bg-primary-50 p-3">
            <label className="flex items-start gap-2 text-sm text-ink-700">
              <input type="checkbox" name="isVolunteer" checked={form.isVolunteer} onChange={handleChange} className="mt-0.5" />
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

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            <Save size={16} /> {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
