// Formata Timestamp do Firestore para data/hora legível
export function formatarDataHora(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return (
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

// Formata minutos para "Xh YYmin"
export function formatarMinutosParaHoras(min) {
  if (!min || min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

// Converte Timestamp ou string de data para objeto Date
export function toDateObject(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (typeof ts === "string") return new Date(ts);
  return null;
}

// Calcula duração em minutos entre dois Timestamps
export function calcularDuracao(inicio, fim) {
  if (!inicio || !fim) return null;
  const s = inicio.toDate ? inicio.toDate() : new Date(inicio);
  const f = fim.toDate ? fim.toDate() : new Date(fim);
  return (f - s) / 60000;
}
