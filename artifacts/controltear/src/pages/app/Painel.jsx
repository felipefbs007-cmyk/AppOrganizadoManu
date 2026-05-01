import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { formatarMinutosParaHoras, toDateObject } from "../../utils/formatters.js";
import Icon from "../../components/Icon.jsx";

function StatCard({ icon, label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={icon} size={18} className="text-gray-500" />
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

function BarChart({ data, max }) {
  if (!data.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-36 truncate flex-shrink-0">{item.label}</span>
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: max ? `${(item.value / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-gray-400 w-10 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DurationChart({ data, max }) {
  if (!data.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-36 truncate flex-shrink-0">{item.label}</span>
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: max ? `${(item.value / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-gray-400 w-16 text-right">{formatarMinutosParaHoras(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

const PERIODOS = [
  { label: "7 dias", dias: 7 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
  { label: "Tudo", dias: null },
];

export default function Painel() {
  const { turma } = useAuth();
  const { paradas, loading } = useParadas(turma);
  const [periodo, setPeriodo] = useState(30);

  const paradasFiltradas = useMemo(() => {
    if (periodo === null) return paradas;
    const corte = new Date();
    corte.setDate(corte.getDate() - periodo);
    return paradas.filter((p) => {
      const d = toDateObject(p.criadoEm);
      return d && d >= corte;
    });
  }, [paradas, periodo]);

  const stats = useMemo(() => {
    const total = paradasFiltradas.length;
    const totalMin = paradasFiltradas.reduce((a, p) => a + (p.duracao || 0), 0);
    const media = total ? Math.round(totalMin / total) : 0;

    const porMotivo = {};
    const porMaquina = {};
    const porOperador = {};

    paradasFiltradas.forEach((p) => {
      if (p.motivo) porMotivo[p.motivo] = (porMotivo[p.motivo] || 0) + 1;
      if (p.maquina) {
        porMaquina[p.maquina] = porMaquina[p.maquina] || { count: 0, min: 0 };
        porMaquina[p.maquina].count++;
        porMaquina[p.maquina].min += p.duracao || 0;
      }
      if (p.operador) porOperador[p.operador] = (porOperador[p.operador] || 0) + 1;
    });

    const rankMotivos = Object.entries(porMotivo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    const rankMaquinas = Object.entries(porMaquina)
      .sort((a, b) => b[1].min - a[1].min)
      .slice(0, 5)
      .map(([label, data]) => ({ label, value: data.min, count: data.count }));

    const rankOperadores = Object.entries(porOperador)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    return { total, totalMin, media, rankMotivos, rankMaquinas, rankOperadores };
  }, [paradasFiltradas]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Painel</h2>
            <p className="text-xs text-gray-500 mt-0.5">{turma}</p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriodo(p.dias)}
              className={`flex-1 text-xs font-medium rounded-lg py-1.5 transition-colors
                ${periodo === p.dias
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-300"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="progress_activity" size={32} className="animate-spin text-blue-500" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="stop_circle" label="Paradas" value={stats.total} color="text-white" />
              <StatCard icon="timer" label="Total" value={formatarMinutosParaHoras(stats.totalMin)} color="text-amber-400" />
              <StatCard icon="avg_pace" label="Média" value={formatarMinutosParaHoras(stats.media)} color="text-blue-400" />
            </div>

            {stats.rankMotivos.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="category" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Top Motivos</h3>
                </div>
                <BarChart
                  data={stats.rankMotivos}
                  max={stats.rankMotivos[0]?.value || 1}
                />
              </div>
            )}

            {stats.rankMaquinas.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="precision_manufacturing" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Teares com mais tempo parado</h3>
                </div>
                <DurationChart
                  data={stats.rankMaquinas}
                  max={stats.rankMaquinas[0]?.value || 1}
                />
              </div>
            )}

            {stats.rankOperadores.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="people" size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Ranking de Registros por Operador</h3>
                </div>
                <BarChart
                  data={stats.rankOperadores}
                  max={stats.rankOperadores[0]?.value || 1}
                />
              </div>
            )}

            {stats.total === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Icon name="bar_chart" size={48} className="text-gray-700" />
                <p className="text-gray-500 text-sm">Sem dados no período selecionado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
