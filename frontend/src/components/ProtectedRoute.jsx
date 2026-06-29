import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Wrap a route element with this to require authentication.
 * `allow` lists which account types may access the route, e.g.
 *   <ProtectedRoute allow={["user"]}>...</ProtectedRoute>
 *   <ProtectedRoute allow={["hospital"]}>...</ProtectedRoute>
 */
const ProtectedRoute = ({ children, allow = ["user"] }) => {
  const { isAuthenticated, authType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !allow.includes(authType)) {
    const redirectTo = allow.length === 1 && allow[0] === "hospital" ? "/hospital/login" : "/login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
