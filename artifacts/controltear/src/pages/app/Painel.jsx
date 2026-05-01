import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { formatarMinutosParaHoras, formatarDataHora, calcularDuracao } from "../../utils/formatters.js";
import { CARGOS_PAINEL, TURMAS } from "../../constants.js";
import Icon from "../../components/Icon.jsx";

function StatCard({ icon, label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={icon} size={16} className="text-gray-500" />
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

function BarraProgresso({ label, value, max, cor = "bg-blue-500", sufixo }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-32 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${cor} transition-all`}
          style={{ width: max ? `${(value / max) * 100}%` : "0%" }}
        />
      </div>
      <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
        {sufixo ? formatarMinutosParaHoras(value) : `${value}x`}
      </span>
    </div>
  );
}

export default function Painel() {
  const { user, turma } = useAuth();
  const hoje = new Date().toISOString().split("T")[0];
  const [dataFiltro, setDataFiltro] = useState(hoje);

  const { paradas, loading } = useParadas(turma, dataFiltro);

  // Bloqueia acesso se não tiver permissão
  if (!CARGOS_PAINEL.includes(user?.funcao)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <Icon name="lock" size={48} className="text-gray-700" />
        <p className="text-gray-500 text-sm">Acesso restrito a Contramestre e Tc Líder.</p>
      </div>
    );
  }

  // ── cálculos ──
  const paradasHoje = paradas.filter((p) => p.data === dataFiltro);
  const abertas = paradas.filter((p) => p.status === "aberta");
  const finalizadas = paradasHoje.filter((p) => p.status === "finalizada");

  const minHoje = paradasHoje.reduce((acc, p) => {
    const dur = calcularDuracao(p.inicio, p.fim);
    return acc + (dur || 0);
  }, 0);

  // Tear mais parado hoje
  const contTear = {};
  paradasHoje.forEach((p) => { contTear[p.numTear] = (contTear[p.numTear] || 0) + 1; });
  const topTear = Object.entries(contTear).sort((a, b) => b[1] - a[1])[0];

  // Ranking motivos
  const contMotivo = {};
  paradasHoje.forEach((p) => { contMotivo[p.motivo] = (contMotivo[p.motivo] || 0) + 1; });
  const rankMotivos = Object.entries(contMotivo).sort((a, b) => b[1] - a[1]);
  const maxMotivo = rankMotivos[0]?.[1] || 1;

  // Top 5 teares por quantidade
  const minsPorTear = {};
  paradasHoje.forEach((p) => {
    if (!minsPorTear[p.numTear]) minsPorTear[p.numTear] = { count: 0, mins: 0 };
    minsPorTear[p.numTear].count++;
    const dur = calcularDuracao(p.inicio, p.fim);
    minsPorTear[p.numTear].mins += dur || 0;
  });
  const rankTeares = Object.entries(minsPorTear)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  const maxTearCount = rankTeares[0]?.[1].count || 1;

  // Comparativo por turma
  const porTurma = {};
  TURMAS.forEach((t) => { porTurma[t] = 0; });
  paradas.filter((p) => p.data === dataFiltro).forEach((p) => {
    if (porTurma[p.turma] !== undefined) porTurma[p.turma]++;
  });
  const maxTurma = Math.max(...Object.values(porTurma), 1);

  // Últimas 6 finalizadas hoje
  const timeline = [...paradasHoje]
    .filter((p) => p.fim)
    .sort((a, b) => b.fim?.seconds - a.fim?.seconds)
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto flex flex-col gap-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Painel</h2>
            <p className="text-xs text-gray-500 mt-0.5">{turma}</p>
          </div>
        </div>

        {/* Seletor de data */}
        <div className="relative">
          <Icon name="calendar_today" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="progress_activity" size={32} className="animate-spin text-blue-500" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        ) : (
          <>
            {/* 4 Cards resumo */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="format_list_numbered"
                label="Paradas Hoje"
                value={paradasHoje.length}
                sub={`${finalizadas.length} finaliz. · ${abertas.length} abertas`}
                color="text-blue-400"
              />
              <StatCard
                icon="schedule"
                label="Horas Paradas"
                value={minHoje > 0 ? formatarMinutosParaHoras(minHoje) : "—"}
                sub="somente hoje"
                color="text-amber-400"
              />
              <StatCard
                icon="warning"
                label="Abertas Agora"
                value={abertas.length}
                sub="todos os turnos"
                color="text-red-400"
              />
              <StatCard
                icon="star"
                label="Tear Crítico"
                value={topTear ? `#${topTear[0]}` : "—"}
                sub={topTear ? `${topTear[1]} parada(s)` : "nenhuma hoje"}
                color="text-amber-400"
              />
            </div>

            {/* Ranking motivos */}
            {rankMotivos.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="bar_chart" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Motivos Mais Frequentes</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {rankMotivos.map(([m, c]) => (
                    <BarraProgresso key={m} label={m} value={c} max={maxMotivo} cor="bg-blue-500" />
                  ))}
                </div>
              </div>
            )}

            {/* Top 5 teares */}
            {rankTeares.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="leaderboard" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Top 5 Teares</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {rankTeares.map(([tear, info], idx) => (
                    <div key={tear} className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-5 text-center ${
                        idx === 0 ? "text-amber-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-700" : "text-gray-600"
                      }`}>#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 font-bold">Tear {tear}</span>
                          <span className="text-gray-500">{info.count} par. · {formatarMinutosParaHoras(info.mins)}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${(info.count / maxTearCount) * 100}%`,
                              background: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "#44474d"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparativo por turma */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="groups" size={16} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-300">Paradas por Turma (hoje)</h3>
              </div>
              <div className="flex items-end gap-4 h-24 px-2">
                {Object.entries(porTurma).map(([t, count]) => (
                  <div key={t} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-300">{count}</span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${Math.max((count / maxTurma) * 72, count > 0 ? 8 : 2)}px`,
                        background: t === turma ? "#3b82f6" : "#334155"
                      }}
                    />
                    <span className={`text-[10px] font-bold uppercase ${t === turma ? "text-blue-400" : "text-gray-600"}`}>
                      {t.replace("Turma ", "T")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linha do tempo */}
            {timeline.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="timeline" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Últimas Finalizadas</h3>
                </div>
                <div className="flex flex-col gap-0">
                  {timeline.map((p) => {
                    const dur = calcularDuracao(p.inicio, p.fim);
                    return (
                      <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                        <div className="w-1 h-8 rounded-full bg-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-white">Tear {p.numTear}</span>
                            <span className="text-xs text-gray-500 font-mono">{formatarDataHora(p.fim)?.split(" ")[1]}</span>
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-xs text-gray-500 truncate">{p.motivo}</span>
                            {dur && <span className="text-xs font-bold text-amber-400 ml-2 flex-shrink-0">{Math.round(dur)}min</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {paradasHoje.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Icon name="bar_chart" size={48} className="text-gray-700" />
                <p className="text-gray-500 text-sm">Sem dados para esta data.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
