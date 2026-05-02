import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastContainer, showToast } from "./components/Toast.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import SelecaoTurma from "./pages/SelecaoTurma.jsx";
import NovaParada from "./pages/app/NovaParada.jsx";
import Lista from "./pages/app/Lista.jsx";
import Painel from "./pages/app/Painel.jsx";
import Icon from "./components/Icon.jsx";
import { CORES_TURMA, TURMAS, CORES_TURMA as CT } from "./constants.js";
import { onMessageListener } from "./notifications.js";

function useForegroundNotifications() {
  useEffect(() => {
    let active = true;

    const listen = async () => {
      try {
        while (active) {
          const payload = await onMessageListener();
          if (!active) break;
          const title = payload?.notification?.title || "ControlTear";
          const body = payload?.notification?.body || "Nova parada registrada.";
          showToast(`${title}: ${body}`, "info");
        }
      } catch (err) {
        console.warn("FCM foreground listener error:", err?.message);
      }
    };

    listen();
    return () => { active = false; };
  }, []);
}

function Header({ turma, onChangeTurma, onLogout, userName }) {
  const cores = CORES_TURMA[turma] || {};
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <Icon name="factory" size={16} className="text-white" filled />
        </div>
        <span className="font-bold text-white text-sm">ControlTear</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onChangeTurma}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border
            ${cores.bg} ${cores.border} ${cores.text}`}
        >
          <span className={`w-2 h-2 rounded-full ${cores.dot}`} />
          {turma}
          <Icon name="swap_horiz" size={14} />
        </button>

        <button
          onClick={onLogout}
          title={`Sair (${userName})`}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Icon name="logout" size={20} />
        </button>
      </div>
    </header>
  );
}

function AppShell() {
  const { user, turma, loading, logout, selecionarTurma } = useAuth();
  const [page, setPage] = useState("nova");
  const [changingTurma, setChangingTurma] = useState(false);
  const [telaAuth, setTelaAuth] = useState("login");

  useForegroundNotifications();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Icon name="progress_activity" size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    if (telaAuth === "cadastro") {
      return <Cadastro onIrLogin={() => setTelaAuth("login")} />;
    }
    return (
      <Login
        onIrCadastro={() => setTelaAuth("cadastro")}
      />
    );
  }

  if (!turma || changingTurma) {
    return (
      <SelecaoTurmaWrapper
        onSelect={(t) => { selecionarTurma(t); setChangingTurma(false); }}
        showBack={changingTurma}
        onBack={() => setChangingTurma(false)}
      />
    );
  }

  const renderPage = () => {
    if (page === "nova") return <NovaParada />;
    if (page === "lista") return <Lista />;
    if (page === "painel") return <Painel />;
    return <NovaParada />;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      <Header
        turma={turma}
        userName={user.nome}
        onChangeTurma={() => setChangingTurma(true)}
        onLogout={logout}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        {renderPage()}
      </main>
      <BottomNav currentPage={page} onNavigate={setPage} />
      <ToastContainer />
    </div>
  );
}

function SelecaoTurmaWrapper({ onSelect, showBack, onBack }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {showBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-gray-200 mb-4 text-sm">
            <Icon name="arrow_back" size={18} />
            Voltar
          </button>
        )}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-900/40">
            <Icon name="factory" size={28} className="text-white" filled />
          </div>
          <h2 className="text-2xl font-bold text-white">Selecionar Turma</h2>
          <p className="text-gray-500 text-sm mt-1">
            Olá, <span className="text-gray-300 font-medium">{user?.nome}</span>
          </p>
        </div>
        <SelecaoTurmaInner onSelect={onSelect} />
        {!showBack && (
          <button
            onClick={logout}
            className="mt-8 w-full text-gray-600 hover:text-gray-400 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="logout" size={16} />
            Sair
          </button>
        )}
      </div>
    </div>
  );
}

function SelecaoTurmaInner({ onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      {TURMAS.map((t) => {
        const cores = CT[t] || {};
        return (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border
              ${cores.bg} ${cores.border} hover:opacity-90 transition-all`}
          >
            <span className={`w-3 h-3 rounded-full ${cores.dot} flex-shrink-0`} />
            <span className={`text-base font-semibold ${cores.text}`}>{t}</span>
            <Icon name="chevron_right" className="ml-auto text-gray-600" size={20} />
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
