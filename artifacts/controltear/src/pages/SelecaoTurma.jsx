import { useAuth } from "../context/AuthContext.jsx";
import { TURMAS, CORES_TURMA } from "../constants.js";
import Icon from "../components/Icon.jsx";

export default function SelecaoTurma() {
  const { user, selecionarTurma, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-900/40">
            <Icon name="factory" size={28} className="text-white" filled />
          </div>
          <h2 className="text-2xl font-bold text-white">Selecionar Turma</h2>
          <p className="text-gray-500 text-sm mt-1">
            Olá, <span className="text-gray-300 font-medium">{user?.nome}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {TURMAS.map((t) => {
            const cores = CORES_TURMA[t] || {};
            return (
              <button
                key={t}
                onClick={() => selecionarTurma(t)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border
                  ${cores.bg} ${cores.border} hover:opacity-90 transition-all active:scale-98`}
              >
                <span className={`w-3 h-3 rounded-full ${cores.dot} flex-shrink-0`} />
                <span className={`text-base font-semibold ${cores.text}`}>{t}</span>
                <Icon name="chevron_right" className="ml-auto text-gray-600" size={20} />
              </button>
            );
          })}
        </div>

        <button
          onClick={logout}
          className="mt-8 w-full text-gray-600 hover:text-gray-400 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Icon name="logout" size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}
