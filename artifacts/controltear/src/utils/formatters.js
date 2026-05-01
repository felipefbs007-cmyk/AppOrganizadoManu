export function formatarDataHora(timestamp) {
  if (!timestamp) return "—";
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarData(timestamp) {
  if (!timestamp) return "—";
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarMinutosParaHoras(minutos) {
  if (!minutos && minutos !== 0) return "—";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function toDateObject(timestamp) {
  if (!timestamp) return null;
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}
export function calcularDuracao(inicio, fim) {
  if (!inicio || !fim) return null;
  const s = inicio?.toDate ? inicio.toDate() : new Date(inicio.seconds * 1000);
  const f = fim?.toDate ? fim.toDate() : new Date(fim.seconds * 1000);
  return (f - s) / 60000;
}