import React from "react";
import { Navigate, useLocation } from "react-router";
import { useLocalAuth } from "../hooks/useLocalAuth";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useLocalAuth();
  const location = useLocation();

  const userRole = user?.is_teacher ? "instructor" : "student";

  console.log("ProtectedRoute user:", user);
  console.log("ProtectedRoute role:", requiredRole, userRole);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={`/${userRole}s/homepage`} replace />;
  }

  return children;
};
