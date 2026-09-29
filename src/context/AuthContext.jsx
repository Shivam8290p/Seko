import React, { createContext, useContext, useState, useEffect } from "react";
import { getSession, saveSession, clearSession } from "../data/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getSession();
    if (stored) setSession(stored);
    setLoading(false);
  }, []);

  const login = (userData) => {
    saveSession(userData);
    setSession(userData);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
