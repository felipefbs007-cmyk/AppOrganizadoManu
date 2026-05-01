import { toDateObject, formatarMinutosParaHoras } from "./formatters.js";

export async function gerarPDFPeriodo({ paradas, turma, dataInicio, dataFim }) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 14;
  let y = margin;

  const addText = (text, x, fontSize = 10, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  const nextLine = (gap = 6) => { y += gap; };

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(248, 250, 252);
  doc.text("ControlTear", margin, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Relatório de Paradas de Produção", margin, 22);

  y = 38;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageW - margin * 2, 16, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Turma: ${turma}`, margin + 4, y + 6);

  const ini = dataInicio ? new Date(dataInicio).toLocaleDateString("pt-BR") : "—";
  const fim = dataFim ? new Date(dataFim).toLocaleDateString("pt-BR") : "—";
  doc.setFont("helvetica", "normal");
  doc.text(`Período: ${ini} a ${fim}`, margin + 4, y + 12);

  y += 24;

  const totalMin = paradas.reduce((acc, p) => acc + (p.duracao || 0), 0);
  const stats = [
    { label: "Total de Paradas", value: String(paradas.length) },
    { label: "Tempo Total", value: formatarMinutosParaHoras(totalMin) },
    { label: "Média por Parada", value: paradas.length ? formatarMinutosParaHoras(Math.round(totalMin / paradas.length)) : "—" },
  ];

  const colW = (pageW - margin * 2) / 3;
  stats.forEach((s, i) => {
    const x = margin + i * colW;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, y, colW - 2, 18, 2, 2, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(s.label, x + 4, y + 6);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(s.value, x + 4, y + 14);
  });

  y += 26;

  const headers = ["Data/Hora", "Máquina", "Motivo", "Operador", "Duração"];
  const colWidths = [36, 28, 50, 42, 26];
  const rowH = 7;

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageW - margin * 2, rowH, "F");
  let xCursor = margin + 2;
  headers.forEach((h, i) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(248, 250, 252);
    doc.text(h, xCursor, y + 5);
    xCursor += colWidths[i];
  });
  y += rowH;

  paradas.forEach((p, idx) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    const bgColor = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(...bgColor);
    doc.rect(margin, y, pageW - margin * 2, rowH, "F");

    const row = [
      formatarDataHoraSimples(p.criadoEm),
      p.maquina || "—",
      p.motivo || "—",
      p.operador || "—",
      formatarMinutosParaHoras(p.duracao),
    ];

    xCursor = margin + 2;
    row.forEach((cell, i) => {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const maxW = colWidths[i] - 4;
      const truncated = doc.getTextWidth(cell) > maxW
        ? doc.splitTextToSize(cell, maxW)[0] + "…"
        : cell;
      doc.text(truncated, xCursor, y + 5);
      xCursor += colWidths[i];
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowH, pageW - margin, y + rowH);
    y += rowH;
  });

  y += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} · ControlTear`, margin, y);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `controltear_${turma.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function formatarDataHoraSimples(timestamp) {
  if (!timestamp) return "—";
  const d = toDateObject(timestamp);
  if (!d) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

