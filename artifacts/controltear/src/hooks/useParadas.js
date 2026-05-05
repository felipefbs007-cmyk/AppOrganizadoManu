import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  Timestamp, or, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// --- INTEGRAÇÃO COM TELEGRAM ---
const enviarTelegram = async (parada, turma) => {
  const TOKEN = "7682222110:AAHGl8dp5fCeMrhKhWpGCqtXR5hqSNYAtas";
  const CHAT_ID = "1106718687"; 

  const mensagem = `🚨 *NOVA PARADA REGISTRADA*\n\n` +
                   `📟 *Tear:* ${parada.numMáquina || parada.numTear}\n` +
                   `🛠️ *Motivo:* ${parada.motivo}\n` +
                   `👥 *Turma:* ${turma}\n` +
                   `👤 *Operador:* ${parada.operador}\n` +
                   `⏰ *Hora:* ${new Date().toLocaleTimeString('pt-BR')}`;

  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: "Markdown"
      })
    });
    console.log("✅ Telegram notificado!");
  } catch (err) {
    console.warn("❌ Falha ao enviar Telegram:", err.message);
  }
};

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

    // Monitora paradas da data selecionada OU que ainda estão abertas
    const q = query(
      collection(db, "paradas"),
      or(
        where("data", "==", dataFiltro),
        where("status", "==", "aberta")
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Monitoramento em tempo real para notificações visuais
      if (!isFirstRun.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !snapshot.metadata.fromCache) {
            const nova = change.doc.data();
            // Dispara evento para o Banner Azul no App.tsx
            window.dispatchEvent(new CustomEvent("notificar-parada", { detail: nova }));
            setNovaParadaEvento(nova);
          }
        });
      }

      setParadas(dados.sort((a, b) => b.inicio?.seconds - a.inicio?.seconds));
      setLoading(false);
      isFirstRun.current = false;
    });

    return () => unsub();
  }, [turma, dataFiltro]);

  // --- FUNÇÃO PARA SALVAR E NOTIFICAR ---
  const salvarParada = async ({ numMáquina, motivo, observacao, operador, data }) => {
    const dadosParada = {
      numMáquina,
      motivo,
      observacao: observacao || "",
      turma,
      data,
      status: "aberta",
      operador,
      inicio: Timestamp.now(),
      fim: null,
    };

    // 1. Salva no Firebase
    await addDoc(collection(db, "paradas"), dadosParada);

    // 2. Dispara Telegram
    enviarTelegram(dadosParada, turma);
  };

  const finalizarParada = async (id) => {
    await updateDoc(doc(db, "paradas", id), {
      status: "finalizada",
      fim: Timestamp.now(),
    });
  };

  const editarParada = async (id, { numMáquina, motivo, observacao, horaInicio, horaFim }) => {
    const updateObj = {
      numMáquina,
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
