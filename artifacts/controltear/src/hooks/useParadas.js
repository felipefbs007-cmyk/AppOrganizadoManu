import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  Timestamp, or, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

async function enfileirarNotificacao({ titulo, corpo, dados }) {
  try {
    await addDoc(collection(db, "notification_requests"), {
      notification: { title: titulo, body: corpo },
      data: dados || {},
      createdAt: serverTimestamp(),
      status: "pending",
    });
  } catch (err) {
    console.warn("Falha ao enfileirar notificação:", err.message);
  }
}

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

    const q = query(
      collection(db, "paradas"),
      or(
        where("data", "==", dataFiltro),
        where("status", "==", "aberta")
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

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

    enfileirarNotificacao({
      titulo: `⚠️ Nova parada — ${turma}`,
      corpo: `Tear ${numTear} parado por: ${motivo}. Operador: ${operador}.`,
      dados: { turma, numTear, motivo, operador, data },
    });
  };

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

  const finalizarParada = async (id) => {
    await updateDoc(doc(db, "paradas", id), {
      status: "finalizada",
      fim: Timestamp.now(),
    });
  };

  const excluirParada = async (id) => {
    await deleteDoc(doc(db, "paradas", id));
  };

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
