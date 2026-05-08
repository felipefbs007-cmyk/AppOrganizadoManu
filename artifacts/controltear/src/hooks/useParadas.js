import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  Timestamp, or, getDocs
} from "firebase/firestore";
import { db } from "../firebase.js";

// --- INTEGRAÇÃO COM TELEGRAM (CONFIGURADA) ---
const enviarTelegram = async (parada, turma) => {
  const TOKEN = "7682222110:AAHGl8dp5fCeMrhKhWpGCqtXR5hqSNYAtas";
  const CHAT_ID = "-1003929994601"; 

  const mensagem = `🚨 *NOVA PARADA REGISTRADA*\n\n` +
                   `📟 *Tear:* ${parada.numTear || parada.numTear}\n` +
                   `🛠️ *Motivo:* ${parada.motivo}\n` +
                   `👥 *Turma:* ${turma}\n` +
                   `👤 *Operador:* ${parada.operador}\n` +
                   `⏰ *Hora:* ${new Date().toLocaleTimeString('pt-BR')}\n\n` +
                   `🔗 *Acesse o App:* https://controlneomec.netlify.app/`;

  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: "Markdown",
        disable_web_page_preview: false 
      })
    });
  } catch (err) {
    console.error("Erro Telegram:", err.message);
  }
};

// --- O HOOK PRINCIPAL (GARANTIDO O EXPORT) ---
export function useParadas(turma, dataFiltro) {
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
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
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !snapshot.metadata.fromCache) {
            window.dispatchEvent(new CustomEvent("notificar-parada", { detail: change.doc.data() }));
          }
        });
      }

      setParadas(dados.sort((a, b) => b.inicio?.seconds - a.inicio?.seconds));
      setLoading(false);
      isFirstRun.current = false;
    });

    return () => unsub();
  }, [turma, dataFiltro]);

  const salvarParada = async ({ numTear, motivo, observacao, operador, data }) => {
    const dadosParada = {
      numTear,
      motivo,
      observacao: observacao || "",
      turma,
      data,
      status: "aberta",
      operador,
      inicio: Timestamp.now(),
      fim: null,
    };

    await addDoc(collection(db, "paradas"), dadosParada);
    enviarTelegram(dadosParada, turma);
  };

  const finalizarParada = async (id) => {
    await updateDoc(doc(db, "paradas", id), {
      status: "finalizada",
      fim: Timestamp.now(),
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
    salvarParada,
    editarParada,
    finalizarParada,
    excluirParada,
    buscarPorPeriodo,
  };
}
