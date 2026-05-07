import { useEffect, useState, type ComponentType } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";

// --- TIPAGEM ---
type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(mod: Record<string, unknown>, name: string): ComponentType | undefined {
  const fns = Object.values(mod).filter((v) => typeof v === "function") as ComponentType[];
  return (mod.default as ComponentType) || (mod.Preview as ComponentType) || (mod[name] as ComponentType) || fns[fns.length - 1];
}

// --- RENDERIZADOR DE TELAS (MANTIDO) ---
function PreviewRenderer({ componentPath, modules }: { componentPath: string; modules: ModuleMap }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);
    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) { setError(`No component found at ${componentPath}.tsx`); return; }
      try {
        const mod = await loader() as any;
        if (cancelled) return;
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) { setError(`No exported React component found in ${componentPath}.tsx`); return; }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;
        setError(`Failed to load preview.`);
      }
    }
    void loadComponent();
    return () => { cancelled = true; };
  }, [componentPath, modules]);

  if (error) return <pre style={{ color: "red", padding: "2rem" }}>{error}</pre>;
  if (!Component) return null;
  return <Component />;
}

// --- COMPONENTE PRINCIPAL APP ---
function App() {
  const [alerta, setAlerta] = useState<any>(null);
  const previewPath = getPreviewPath();

  // --- 1. LÓGICA DE INSTALAÇÃO PWA (PERGUNTAR SE QUER BAIXAR) ---
  useEffect(() => {
    const handler = (e: any) => {
      // Impede o banner padrão do Chrome para a gente controlar
      e.preventDefault();
      const savePrompt = e;
      
      // Pergunta após 5 segundos de uso
      setTimeout(() => {
        if (window.confirm("Deseja instalar o Manucontrol no seu celular para acesso rápido?")) {
          savePrompt.prompt();
          savePrompt.userChoice.then((choice: any) => {
            if (choice.outcome === 'accepted') console.log('App Instalado!');
          });
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- 2. LÓGICA DE NOTIFICAÇÃO VISUAL (BANNER AZUL) ---
  useEffect(() => {
    const ouvirEvento = (e: any) => {
      const dados = e.detail;
      const userLogado = JSON.parse(localStorage.getItem("@ControlTear:user") || "{}");

      // Só mostra se não foi você quem lançou
      if (dados.operador !== userLogado?.nome) {
        setAlerta(dados);
        
        // Toca o alerta sonoro (bip rápido)
        try {
          const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audio.createOscillator();
          osc.connect(audio.destination);
          osc.start();
          osc.stop(audio.currentTime + 0.2);
        } catch (err) { console.log("Áudio bloqueado pelo navegador"); }

        // Fecha o banner após 7 segundos
        setTimeout(() => setAlerta(null), 7000);
      }
    };

    window.addEventListener("notificar-parada", ouvirEvento);
    return () => window.removeEventListener("notificar-parada", ouvirEvento);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Renderiza a tela atual do App */}
      {previewPath ? (
        <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />
      ) : (
        <Gallery />
      )}

      {/* --- BANNER DE NOTIFICAÇÃO PROFISSIONAL --- */}
      {alerta && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-blue-600 border-2 border-white text-white p-4 rounded-2xl shadow-2xl animate-bounce cursor-pointer"
          onClick={() => setAlerta(null)}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">notifications_active</span>
            <div>
              <p className="font-black text-sm uppercase tracking-tight">🚨 NOVO REGISTRO: TEAR {alerta.numMáquina || alerta.numTear}</p>
              <p className="text-xs opacity-90">{alerta.motivo} — Por: {alerta.operador}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- FUNÇÕES AUXILIARES ---
function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manucontrol Preview</h1>
        <p className="text-gray-500">Selecione uma tela para visualizar.</p>
      </div>
    </div>
  );
}

function getBasePath() { return import.meta.env.BASE_URL.replace(/\/$/, ""); }
function getPreviewPath() {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

export default App;
