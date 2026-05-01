import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "controltear_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [turma, setTurma] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setTurma(parsed.turma || null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = (nome, cargo) => {
    const userData = { nome, cargo };
    setUser(userData);
    setTurma(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, turma: null }));
  };

  const logout = () => {
    setUser(null);
    setTurma(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const selecionarTurma = (nomeTurma) => {
    setTurma(nomeTurma);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, turma: nomeTurma }));
  };

  return (
    <AuthContext.Provider value={{ user, turma, loading, login, logout, selecionarTurma }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
