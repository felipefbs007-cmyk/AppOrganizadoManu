import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { MOTIVOS } from "../../constants.js";
import Icon from "../../components/Icon.jsx";
import { showToast } from "../../components/Toast.jsx";

function Campo({ label, children, erro }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</label>
      {children}
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
    </div>
  );
}

const inputCls = `w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
  placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
  text-sm transition-all`;

export default function NovaParada({ paradaParaEditar, onFinish }) {
  const { user, turma } = useAuth();
  const hoje = new Date().toISOString().split("T")[0];
  const { salvarParada, editarParada } = useParadas(turma, hoje);

  const editing = !!paradaParaEditar;

  // Converte Timestamp para string datetime-local
  const tsToInput = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [numTear, setNumTear] = useState(paradaParaEditar?.numTear || "");
  const [motivo, setMotivo] = useState(paradaParaEditar?.motivo || MOTIVOS[0]);
  const [obs, setObs] = useState(paradaParaEditar?.observacao || "");
  const [horaInicio, setHoraInicio] = useState(tsToInput(paradaParaEditar?.inicio));
  const [horaFim, setHoraFim] = useState(tsToInput(paradaParaEditar?.fim));
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const validar = () => {
    const e = {};
    if (!numTear) e.numTear = "Informe o número do tear.";
    if (editing && !horaInicio) e.horaInicio = "Informe o horário de início.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length) return setErros(e2);
    setErros({});
    setLoading(true);
    try {
      if (editing) {
        await editarParada(paradaParaEditar.id, { numTear, motivo, observacao: obs, horaInicio, horaFim });
        showToast("Parada atualizada!", "success");
      } else {
        await salvarParada({ numTear, motivo, observacao: obs, operador: user?.nome, data: hoje });
        showToast("Parada registrada!", "success");
        setNumTear(""); setObs("");
      }
      if (onFinish) onFinish();
    } catch (err) {
      showToast("Erro ao salvar: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          {editing && (
            <button onClick={onFinish} className="text-gray-400 hover:text-white">
              <Icon name="arrow_back" size={24} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">
              {editing ? "Editar Parada" : "Nova Parada"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{turma} · {user?.nome}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Tear */}
          <Campo label="Número do Tear" erro={erros.numTear}>
            <div className="relative">
              <Icon name="settings_input_component" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                min="1"
                max="17"
                value={numTear}
                onChange={(e) => setNumTear(e.target.value)}
                placeholder="Ex: 17"
                className={`${inputCls} pl-9`}
              />
            </div>
          </Campo>

          {/* Motivo */}
          <Campo label="Motivo da Parada">
            <div className="relative">
              <Icon name="error_outline" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className={`${inputCls} pl-9 appearance-none`}
              >
                {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </Campo>

          {/* Campos de edição de horário — só no modo editar */}
          {editing && (
            <>
              <Campo label="Horário de Início" erro={erros.horaInicio}>
                <input
                  type="datetime-local"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className={inputCls}
                />
              </Campo>
              <Campo label="Horário de Fim">
                <input
                  type="datetime-local"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className={inputCls}
                />
              </Campo>
            </>
          )}

          {/* Observação */}
          <Campo label="Observação (opcional)">
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Campo>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold
              rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <Icon name="progress_activity" size={20} className="animate-spin" />
              : <Icon name={editing ? "save" : "add_circle"} size={20} />
            }
            {loading ? "Salvando..." : editing ? "Salvar Alterações" : "Registrar Parada"}
          </button>
        </form>
      </div>
    </div>
  );
}
