
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/Spinner";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/auth" }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
