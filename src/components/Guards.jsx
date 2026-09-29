import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children, role }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (role && session.role !== role) {
    return <Navigate to={session.role === "seller" ? "/seller/dashboard" : "/"} replace />;
  }
  return children;
}

export function RequireGuest({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) {
    return <Navigate to={session.role === "seller" ? "/seller/dashboard" : "/"} replace />;
  }
  return children;
}
