import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RequireRole = ({ allowed }: { allowed: string[] }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (!user || !allowed.includes(user.role_name)) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};

export default RequireRole;
