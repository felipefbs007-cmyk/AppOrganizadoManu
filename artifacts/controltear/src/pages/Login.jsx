import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";

export default function Login({ onIrCadastro }) {
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return setErro("Informe seu usuário.");
    if (!senha.trim()) return setErro("Informe sua senha.");
    setErro("");
    setCarregando(true);
    try {
      await login(nome.trim(), senha, manter);
    } catch (err) {
      setErro(err.message || "Erro ao fazer login.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
            <Icon name="precision_manufacturing" size={32} className="text-white" filled />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ControlMáquina</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de Paradas de Produção</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">

          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {erro}
            </div>
          )}

          {/* Usuário */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Usuário
            </label>
            <div className="relative">
              <Icon name="person" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome de usuário"
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Senha
            </label>
            <div className="relative">
              <Icon name="lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Manter conectado */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="manter"
              checked={manter}
              onChange={e => setManter(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="manter" className="text-sm text-gray-400 cursor-pointer">
              Manter conectado
            </label>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Icon name="login" size={18} className="text-white" />
            {carregando ? "Entrando..." : "ENTRAR"}
          </button>

          {/* Link cadastro */}
          <p
            onClick={onIrCadastro}
            className="text-center text-blue-400 text-sm cursor-pointer hover:underline"
          >
            Criar nova conta
          </p>
        </form>
      </div>
    </div>
  );
}
