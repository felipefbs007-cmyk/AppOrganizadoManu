import { formatarDataHora, formatarMinutosParaHoras } from "./formatters.js";

export function gerarPDFPeriodo({ paradas, dataInicio, dataFim }) {
  if (!paradas || paradas.length === 0) {
    throw new Error("Nenhum registro encontrado neste período!");
  }

  const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

  const linhas = paradas
    .map((p) => {
      const durMin =
        p.fim && p.inicio
          ? (p.fim.seconds - p.inicio.seconds) / 60
          : null;
      const duracao = durMin ? formatarMinutosParaHoras(durMin) : "—";
      const statusCls = p.status === "aberta" ? "color:#dc2626;font-weight:bold" : "color:#16a34a;font-weight:bold";
      return `
        <tr>
          <td style="padding:7px 8px;text-align:center">${fmtData(p.data)}</td>
          <td style="padding:7px 8px;text-align:center;font-weight:bold">${p.numTear}</td>
          <td style="padding:7px 8px;text-align:center">${p.turma}</td>
          <td style="padding:7px 8px">${p.motivo}</td>
          <td style="padding:7px 8px;text-align:center">${formatarDataHora(p.inicio)}</td>
          <td style="padding:7px 8px;text-align:center">${formatarDataHora(p.fim)}</td>
          <td style="padding:7px 8px;text-align:center">${duracao}</td>
          <td style="padding:7px 8px;text-align:center;${statusCls}">${p.status}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Relatório ControlTear</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #111; }
          h2 { text-align: center; margin-bottom: 4px; }
          .sub { text-align:center; color:#555; font-size:13px; margin-bottom:20px; }
          table { width:100%; border-collapse:collapse; font-size:12px; }
          th { background:#1e3a5f; color:#fff; padding:8px; text-align:center; }
          td { border-bottom:1px solid #ddd; }
          tr:nth-child(even) td { background:#f5f7fa; }
          .footer { margin-top:16px; font-size:11px; color:#888; text-align:right; }
        </style>
      </head>
      <body>
        <h2>Relatório de Paradas — ControlTear</h2>
        <p class="sub">${fmtData(dataInicio)} até ${fmtData(dataFim)} · ${paradas.length} registro(s)</p>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Tear</th><th>Turma</th><th>Motivo</th>
              <th>Início</th><th>Fim</th><th>Duração</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
        <div class="footer">Gerado em ${new Date().toLocaleString("pt-BR")} · ControlTear</div>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_${dataInicio}_${dataFim}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
