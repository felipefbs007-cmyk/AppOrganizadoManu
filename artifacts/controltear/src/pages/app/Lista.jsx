import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { formatarDataHora, formatarMinutosParaHoras, toDateObject } from "../../utils/formatters.js";
import { gerarPDFPeriodo } from "../../utils/pdfExport.js";
import Icon from "../../components/Icon.jsx";
import { showToast } from "../../components/Toast.jsx";
import NovaParada from "./NovaParada.jsx";

function MotivoBadge({ motivo }) {
  return (
    <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-full px-2.5 py-0.5 truncate max-w-[140px]">
      {motivo}
    </span>
  );
}

export default function Lista() {
  const { turma } = useAuth();
  const { paradas, loading, excluirParada } = useParadas(turma);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [exportando, setExportando] = useState(false);

  const paradasFiltradas = useMemo(() => {
    return paradas.filter((p) => {
      const d = toDateObject(p.criadoEm);
      if (dataInicio && d && d < new Date(dataInicio)) return false;
      if (dataFim && d) {
        const fim = new Date(dataFim);
        fim.setDate(fim.getDate() + 1);
        if (d >= fim) return false;
      }
      if (busca) {
        const b = busca.toLowerCase();
        if (
          !p.maquina?.toLowerCase().includes(b) &&
          !p.motivo?.toLowerCase().includes(b) &&
          !p.operador?.toLowerCase().includes(b)
        ) return false;
      }
      return true;
    });
  }, [paradas, dataInicio, dataFim, busca]);

  const handleExcluir = async (id) => {
    try {
      await excluirParada(id);
      showToast("Parada excluída.", "success");
    } catch {
      showToast("Erro ao excluir.", "error");
    }
    setConfirmando(null);
  };

  const handlePDF = async () => {
    if (paradasFiltradas.length === 0) return showToast("Nenhuma parada no período.", "warning");
    setExportando(true);
    try {
      await gerarPDFPeriodo({ paradas: paradasFiltradas, turma, dataInicio, dataFim });
      showToast("PDF gerado!", "success");
    } catch (e) {
      showToast("Erro ao gerar PDF: " + e.message, "error");
    }
    setExportando(false);
  };

  if (editando) {
    return <NovaParada paradaParaEditar={editando} onFinish={() => setEditando(null)} />;
  }

  const inputCls = "bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Histórico</h2>
            <p className="text-xs text-gray-500 mt-0.5">{turma}</p>
          </div>
          <button
            onClick={handlePDF}
            disabled={exportando}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700
              text-gray-300 text-sm rounded-xl px-3 py-2 transition-colors disabled:opacity-60"
          >
            {exportando
              ? <Icon name="progress_activity" size={16} className="animate-spin" />
              : <Icon name="picture_as_pdf" size={16} />}
            PDF
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por tear, motivo ou operador..."
            className={`${inputCls} w-full`}
          />
          <div className="flex gap-2">
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={`${inputCls} flex-1`} />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={`${inputCls} flex-1`} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="progress_activity" size={32} className="animate-spin text-blue-500" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        ) : paradasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="inbox" size={48} className="text-gray-700" />
            <p className="text-gray-500 text-sm">Nenhuma parada encontrada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-600">{paradasFiltradas.length} parada(s) encontrada(s)</p>
            {paradasFiltradas.map((p) => (
              <div
                key={p.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{p.maquina || "—"}</span>
                      <MotivoBadge motivo={p.motivo} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Icon name="person" size={12} />
                      {p.operador || "—"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-blue-400 font-bold text-sm">{formatarMinutosParaHoras(p.duracao)}</div>
                  </div>
                </div>

                {p.observacao && (
                  <p className="text-xs text-gray-500 border-t border-gray-800 pt-2 mt-1">{p.observacao}</p>
                )}

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-600">{formatarDataHora(p.criadoEm)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditando(p)}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmando(p.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </div>

                {confirmando === p.id && (
                  <div className="flex items-center gap-2 bg-red-950/40 border border-red-900 rounded-xl p-3 mt-1">
                    <Icon name="warning" size={16} className="text-red-400" filled />
                    <span className="text-xs text-red-300 flex-1">Confirmar exclusão?</span>
                    <button
                      onClick={() => handleExcluir(p.id)}
                      className="text-xs bg-red-700 hover:bg-red-600 text-white rounded-lg px-3 py-1"
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => setConfirmando(null)}
                      className="text-xs text-gray-400 hover:text-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
