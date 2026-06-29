import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegister from "./pages/HospitalRegister";
import UserDashboard from "./pages/UserDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import BystanderAlert from "./pages/BystanderAlert";
import AlertStatus from "./pages/AlertStatus";
import Profile from "./pages/Profile";

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <h1 className="font-display text-3xl font-bold text-ink-900">404</h1>
    <p className="mt-2 text-ink-500">The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allow={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allow={["user"]}>
                <BystanderAlert />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allow={["user"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allow={["user"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alert/:id"
            element={
              <ProtectedRoute allow={["user"]}>
                <AlertStatus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allow={["hospital"]}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
