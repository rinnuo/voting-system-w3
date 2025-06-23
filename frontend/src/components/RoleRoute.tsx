import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RoleRoute;