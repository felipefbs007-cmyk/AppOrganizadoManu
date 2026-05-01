import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  Timestamp, or, getDocs,
} from "firebase/firestore";
import { db } from "../firebase.js";

export function useParadas(turma, dataFiltro) {
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaParadaEvento, setNovaParadaEvento] = useState(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!turma || !dataFiltro) {
      setParadas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    isFirstRun.current = true;

    // Escuta paradas da data selecionada OU paradas abertas de qualquer turma
    const q = query(
      collection(db, "paradas"),
      or(
        where("data", "==", dataFiltro),
        where("status", "==", "aberta")
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Notificação de nova parada de outro operador
      if (!isFirstRun.current) {
        const novas = snapshot.docChanges().filter((c) => c.type === "added");
        if (novas.length > 0) {
          const nova = novas[0].doc.data();
          setNovaParadaEvento(nova);
        }
      }

      setParadas(dados.sort((a, b) => b.inicio?.seconds - a.inicio?.seconds));
      setLoading(false);
      isFirstRun.current = false;
    });

    return () => unsub();
  }, [turma, dataFiltro]);

  // Registrar nova parada (status aberta)
  const salvarParada = async ({ numTear, motivo, observacao, operador, data }) => {
    await addDoc(collection(db, "paradas"), {
      numTear,
      motivo,
      observacao: observacao || "",
      turma,
      data,
      status: "aberta",
      operador,
      inicio: Timestamp.now(),
      fim: null,
    });
  };

  // Editar parada existente
  const editarParada = async (id, { numTear, motivo, observacao, horaInicio, horaFim }) => {
    const updateObj = {
      numTear,
      motivo,
      observacao: observacao || "",
      inicio: Timestamp.fromDate(new Date(horaInicio)),
    };
    if (horaFim) {
      updateObj.fim = Timestamp.fromDate(new Date(horaFim));
      updateObj.status = "finalizada";
    }
    await updateDoc(doc(db, "paradas", id), updateObj);
  };

  // Finalizar parada (marcar fim agora)
  const finalizarParada = async (id) => {
    await updateDoc(doc(db, "paradas", id), {
      status: "finalizada",
      fim: Timestamp.now(),
    });
  };

  // Excluir parada
  const excluirParada = async (id) => {
    await deleteDoc(doc(db, "paradas", id));
  };

  // Buscar paradas por período (para PDF)
  const buscarPorPeriodo = async (dataInicio, dataFim) => {
    const q = query(
      collection(db, "paradas"),
      where("data", ">=", dataInicio),
      where("data", "<=", dataFim)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => d.data())
      .sort((a, b) => a.inicio?.seconds - b.inicio?.seconds);
  };

  return {
    paradas,
    loading,
    novaParadaEvento,
    salvarParada,
    editarParada,
    finalizarParada,
    excluirParada,
    buscarPorPeriodo,
  };
}
