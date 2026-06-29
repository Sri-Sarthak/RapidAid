import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HospitalLogin = () => {
  const { loginHospital } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginHospital(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/hospital/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="card w-full p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Building2 size={22} />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">Hospital Portal</h1>
          <p className="mt-1 text-sm text-ink-500">Manage bed availability and facilities</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Hospital email</label>
            <input
              type="email"
              name="email"
              required
              className="input"
              placeholder="hospital@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              required
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <LogIn size={16} /> {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          New hospital?{" "}
          <Link to="/hospital/register" className="font-semibold text-primary-700 hover:underline">
            Register your hospital
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-500">
          <Link to="/login" className="font-semibold text-primary-700 hover:underline">
            Back to user login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalLogin;
