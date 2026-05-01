import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { formatarDataHora, calcularDuracao, formatarMinutosParaHoras } from "../../utils/formatters.js";
import { gerarPDFPeriodo } from "../../utils/pdfExport.js";
import { CARGOS_GESTAO } from "../../constants.js";
import Icon from "../../components/Icon.jsx";
import { showToast } from "../../components/Toast.jsx";
import NovaParada from "./NovaParada.jsx";

const inputCls = "bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";

export default function Lista() {
  const { user, turma } = useAuth();
  const hoje = new Date().toISOString().split("T")[0];
  const [dataFiltro, setDataFiltro] = useState(hoje);
  const [dataInicioPdf, setDataInicioPdf] = useState(hoje);
  const [dataFimPdf, setDataFimPdf] = useState(hoje);
  const [editando, setEditando] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [mostrarPdf, setMostrarPdf] = useState(false);

  const { paradas, loading, finalizarParada, excluirParada, buscarPorPeriodo } = useParadas(turma, dataFiltro);
  const podeGestao = CARGOS_GESTAO.includes(user?.funcao);

  const handleFinalizar = async (id) => {
    try {
      await finalizarParada(id);
      showToast("Parada finalizada!", "success");
    } catch {
      showToast("Erro ao finalizar.", "error");
    }
  };

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
    setExportando(true);
    try {
      const dados = await buscarPorPeriodo(dataInicioPdf, dataFimPdf);
      gerarPDFPeriodo({ paradas: dados, dataInicio: dataInicioPdf, dataFim: dataFimPdf });
      showToast("Relatório gerado!", "success");
    } catch (e) {
      showToast(e.message || "Erro ao gerar PDF.", "error");
    }
    setExportando(false);
  };

  if (editando) {
    return <NovaParada paradaParaEditar={editando} onFinish={() => setEditando(null)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Histórico</h2>
            <p className="text-xs text-gray-500 mt-0.5">{turma}</p>
          </div>
          <button
            onClick={() => setMostrarPdf(!mostrarPdf)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700
              text-gray-300 text-sm rounded-xl px-3 py-2 transition-colors"
          >
            <Icon name="picture_as_pdf" size={16} />
            PDF
          </button>
        </div>

        {/* Painel PDF */}
        {mostrarPdf && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Gerar Relatório</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 mb-1">INÍCIO</p>
                <input type="date" value={dataInicioPdf} onChange={(e) => setDataInicioPdf(e.target.value)} className={`${inputCls} w-full`} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 mb-1">FIM</p>
                <input type="date" value={dataFimPdf} onChange={(e) => setDataFimPdf(e.target.value)} className={`${inputCls} w-full`} />
              </div>
            </div>
            <button
              onClick={handlePDF}
              disabled={exportando}
              className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold
                rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {exportando
                ? <Icon name="progress_activity" size={16} className="animate-spin" />
                : <Icon name="download" size={16} />
              }
              {exportando ? "Gerando..." : "Baixar Relatório"}
            </button>
          </div>
        )}

        {/* Filtro de data */}
        <div className="mb-4">
          <div className="relative">
            <Icon name="calendar_today" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className={`${inputCls} w-full pl-9`}
            />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="progress_activity" size={32} className="animate-spin text-blue-500" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        ) : paradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon name="inbox" size={48} className="text-gray-700" />
            <p className="text-gray-500 text-sm">Nenhuma parada encontrada.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-600">{paradas.length} parada(s)</p>
            {paradas.map((p) => {
              const isOutraTurma = p.turma !== turma && p.status === "aberta";
              const borderColor = p.status === "aberta"
                ? isOutraTurma ? "border-l-amber-500" : "border-l-red-500"
                : "border-l-green-500";
              const durMin = calcularDuracao(p.inicio, p.fim);

              return (
                <div
                  key={p.id}
                  className={`bg-gray-900 border border-gray-800 border-l-4 ${borderColor} rounded-2xl p-4 flex flex-col gap-2`}
                >
                  {/* Topo */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">TEAR {p.numTear}</span>
                        {isOutraTurma && (
                          <span className="text-[9px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">
                            ABERTA {p.turma}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === "aberta"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {p.status === "aberta" ? "ABERTA" : "FINALIZADA"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">{p.motivo}</span>
                    </div>

                    {podeGestao && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditando(p)} className="text-gray-500 hover:text-blue-400 transition-colors">
                          <Icon name="edit" size={16} />
                        </button>
                        <button onClick={() => setConfirmando(p.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Horários */}
                  <div className="text-xs text-gray-500 flex flex-col gap-0.5 border-t border-gray-800 pt-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Icon name="flight_takeoff" size={12} />
                      Início: <strong className="text-gray-300">{formatarDataHora(p.inicio)}</strong>
                    </div>
                    {p.fim && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Icon name="flag" size={12} />
                        Fim: <strong>{formatarDataHora(p.fim)}</strong>
                        {durMin && <span className="text-gray-500 ml-1">· {formatarMinutosParaHoras(durMin)}</span>}
                      </div>
                    )}
                    {p.observacao && (
                      <p className="text-gray-600 mt-1">{p.observacao}</p>
                    )}
                  </div>

                  {/* Finalizar */}
                  {p.status === "aberta" && podeGestao && (
                    <button
                      onClick={() => handleFinalizar(p.id)}
                      className="mt-1 w-full bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold
                        rounded-xl py-2 transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="check_circle" size={16} />
                      FINALIZAR
                    </button>
                  )}

                  {/* Confirmar exclusão */}
                  {confirmando === p.id && (
                    <div className="flex items-center gap-2 bg-red-950/40 border border-red-900 rounded-xl p-3 mt-1">
                      <Icon name="warning" size={16} className="text-red-400" />
                      <span className="text-xs text-red-300 flex-1">Confirmar exclusão?</span>
                      <button onClick={() => handleExcluir(p.id)} className="text-xs bg-red-700 hover:bg-red-600 text-white rounded-lg px-3 py-1">
                        Excluir
                      </button>
                      <button onClick={() => setConfirmando(null)} className="text-xs text-gray-400 hover:text-gray-200">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
