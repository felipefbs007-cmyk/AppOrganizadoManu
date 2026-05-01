import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

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

  // Login verifica nome + senha no Firestore
  const login = async (nome, senha, manter) => {
    const q = query(
      collection(db, "usuarios"),
      where("nome", "==", nome),
      where("senha", "==", senha)
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("Usuário ou senha incorretos!");

    const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setUser(userData);
    setTurma(null);
    if (manter) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, turma: null }));
    }
    return userData;
  };

  // Cadastro salva na coleção usuarios
  const cadastrar = async (nome, senha, funcao) => {
    // Verifica se nome já existe
    const q = query(collection(db, "usuarios"), where("nome", "==", nome));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error("Este nome de usuário já existe!");

    const docRef = await addDoc(collection(db, "usuarios"), {
      nome,
      senha,
      funcao,
      criadoEm: new Date().toISOString(),
    });
    const userData = { id: docRef.id, nome, funcao };
    setUser(userData);
    setTurma(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, turma: null }));
    return userData;
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
    <AuthContext.Provider value={{ user, turma, loading, login, cadastrar, logout, selecionarTurma }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}