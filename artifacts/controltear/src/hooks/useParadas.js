import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

export function useParadas(turma) {
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!turma) {
      setParadas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "paradas"),
      where("turma", "==", turma),
      orderBy("criadoEm", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setParadas(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [turma]);

  const salvarParada = async (dados) => {
    await addDoc(collection(db, "paradas"), {
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  };

  const editarParada = async (id, dados) => {
    const ref = doc(db, "paradas", id);
    await updateDoc(ref, {
      ...dados,
      atualizadoEm: serverTimestamp(),
    });
  };

  const excluirParada = async (id) => {
    await deleteDoc(doc(db, "paradas", id));
  };

  return { paradas, loading, error, salvarParada, editarParada, excluirParada };
}
