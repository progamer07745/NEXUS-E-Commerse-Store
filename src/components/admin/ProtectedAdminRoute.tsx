import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user || (user.role !== "admin" && !user.isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;