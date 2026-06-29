import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Siren, Menu, X, LogOut, Building2, UserCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { isAuthenticated, authType, user, hospital, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const linkClass = (path) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      location.pathname === path ? "bg-primary-50 text-primary-700" : "text-ink-600 hover:bg-ink-50"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emergency-600 text-white">
            <Siren size={18} />
          </span>
          RapidAid
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {!isAuthenticated && (
            <>
              <Link to="/" className={linkClass("/")}>Home</Link>
              <Link to="/login" className={linkClass("/login")}>User Login</Link>
              <Link to="/register" className={linkClass("/register")}>Sign Up</Link>
              <Link to="/hospital/login" className="btn-outline ml-2">
                <Building2 size={15} /> Hospital Portal
              </Link>
            </>
          )}

          {isAuthenticated && authType === "user" && (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
              <Link to="/report" className={linkClass("/report")}>Report Accident</Link>
              <Link to="/volunteer" className={linkClass("/volunteer")}>Volunteer Hub</Link>
              <Link to="/profile" className={linkClass("/profile")}>Profile</Link>
              <NotificationBell />
              <div className="ml-2 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                <UserCircle2 size={16} />
                {user?.name?.split(" ")[0]}
              </div>
              <button onClick={handleLogout} className="btn-outline">
                <LogOut size={15} /> Logout
              </button>
            </>
          )}

          {isAuthenticated && authType === "hospital" && (
            <>
              <Link to="/hospital/dashboard" className={linkClass("/hospital/dashboard")}>
                Hospital Dashboard
              </Link>
              <div className="ml-2 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                <Building2 size={16} />
                {hospital?.name}
              </div>
              <button onClick={handleLogout} className="btn-outline">
                <LogOut size={15} /> Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="rounded-lg p-2 hover:bg-ink-100 md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-100 px-4 py-3 md:hidden">
          {!isAuthenticated && (
            <>
              <Link to="/" className={linkClass("/")} onClick={() => setOpen(false)}>Home</Link>
              <Link to="/login" className={linkClass("/login")} onClick={() => setOpen(false)}>User Login</Link>
              <Link to="/register" className={linkClass("/register")} onClick={() => setOpen(false)}>Sign Up</Link>
              <Link to="/hospital/login" className={linkClass("/hospital/login")} onClick={() => setOpen(false)}>Hospital Portal</Link>
            </>
          )}
          {isAuthenticated && authType === "user" && (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/report" className={linkClass("/report")} onClick={() => setOpen(false)}>Report Accident</Link>
              <Link to="/volunteer" className={linkClass("/volunteer")} onClick={() => setOpen(false)}>Volunteer Hub</Link>
              <Link to="/profile" className={linkClass("/profile")} onClick={() => setOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="btn-outline mt-1 justify-start">
                <LogOut size={15} /> Logout
              </button>
            </>
          )}
          {isAuthenticated && authType === "hospital" && (
            <>
              <Link to="/hospital/dashboard" className={linkClass("/hospital/dashboard")} onClick={() => setOpen(false)}>
                Hospital Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline mt-1 justify-start">
                <LogOut size={15} /> Logout
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
