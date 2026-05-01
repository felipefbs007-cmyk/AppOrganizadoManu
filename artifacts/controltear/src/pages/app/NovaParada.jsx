import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useParadas } from "../../hooks/useParadas.js";
import { MOTIVOS } from "../../constants.js";
import Icon from "../../components/Icon.jsx";
import { showToast } from "../../components/Toast.jsx";

const MAQUINAS = Array.from({ length: 30 }, (_, i) => `Tear ${String(i + 1).padStart(2, "0")}`);

function Campo({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = `w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
  placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
  text-sm transition-all`;

export default function NovaParada({ paradaParaEditar, onFinish }) {
  const { user, turma } = useAuth();
  const { salvarParada, editarParada } = useParadas(turma);

  const editing = !!paradaParaEditar;

  const [form, setForm] = useState({
    maquina: paradaParaEditar?.maquina || "",
    motivo: paradaParaEditar?.motivo || "",
    operador: paradaParaEditar?.operador || user?.nome || "",
    duracao: paradaParaEditar?.duracao !== undefined ? String(paradaParaEditar.duracao) : "",
    observacao: paradaParaEditar?.observacao || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.maquina) errs.maquina = "Selecione a máquina.";
    if (!form.motivo) errs.motivo = "Selecione o motivo.";
    if (!form.operador.trim()) errs.operador = "Informe o operador.";
    if (!form.duracao || isNaN(Number(form.duracao)) || Number(form.duracao) <= 0)
      errs.duracao = "Informe uma duração válida (em minutos).";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setLoading(true);
    try {
      const dados = {
        maquina: form.maquina,
        motivo: form.motivo,
        operador: form.operador.trim(),
        duracao: Number(form.duracao),
        observacao: form.observacao.trim(),
        turma,
        registradoPor: user?.nome,
        cargo: user?.cargo,
      };
      if (editing) {
        await editarParada(paradaParaEditar.id, dados);
        showToast("Parada atualizada!", "success");
      } else {
        await salvarParada(dados);
        showToast("Parada registrada!", "success");
        setForm({ maquina: "", motivo: "", operador: user?.nome || "", duracao: "", observacao: "" });
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
            <p className="text-xs text-gray-500 mt-0.5">{turma}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Campo label="Máquina (Tear)">
            <select value={form.maquina} onChange={set("maquina")} className={inputCls}>
              <option value="">Selecione o tear</option>
              {MAQUINAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.maquina && <p className="text-red-400 text-xs mt-1">{errors.maquina}</p>}
          </Campo>

          <Campo label="Motivo da Parada">
            <select value={form.motivo} onChange={set("motivo")} className={inputCls}>
              <option value="">Selecione o motivo</option>
              {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.motivo && <p className="text-red-400 text-xs mt-1">{errors.motivo}</p>}
          </Campo>

          <Campo label="Operador Responsável">
            <input
              type="text"
              value={form.operador}
              onChange={set("operador")}
              placeholder="Nome do operador"
              className={inputCls}
            />
            {errors.operador && <p className="text-red-400 text-xs mt-1">{errors.operador}</p>}
          </Campo>

          <Campo label="Duração (minutos)">
            <input
              type="number"
              min="1"
              value={form.duracao}
              onChange={set("duracao")}
              placeholder="Ex: 30"
              className={inputCls}
            />
            {errors.duracao && <p className="text-red-400 text-xs mt-1">{errors.duracao}</p>}
          </Campo>

          <Campo label="Observação (opcional)">
            <textarea
              value={form.observacao}
              onChange={set("observacao")}
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
            {loading ? (
              <Icon name="progress_activity" size={20} className="animate-spin" />
            ) : (
              <Icon name={editing ? "save" : "add_circle"} size={20} />
            )}
            {loading ? "Salvando..." : editing ? "Salvar Alterações" : "Registrar Parada"}
          </button>
        </form>
      </div>
    </div>
  );
}
