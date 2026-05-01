import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { CARGOS } from "../constants.js";
import Icon from "../components/Icon.jsx";

export default function Cadastro({ onIrLogin }) {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [funcao, setFuncao] = useState(CARGOS[0]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return setErro("Informe um nome de usuário.");
    if (senha.length < 4) return setErro("Senha deve ter ao menos 4 caracteres.");
    if (senha !== confirmarSenha) return setErro("As senhas não coincidem.");
    setErro("");
    setCarregando(true);
    try {
      await cadastrar(nome.trim(), senha, funcao);
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
            <Icon name="precision_manufacturing" size={32} className="text-white" filled />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ControlTear</h1>
          <p className="text-gray-500 text-sm mt-1">Criar nova conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">

          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {erro}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Nome de Usuário
            </label>
            <div className="relative">
              <Icon name="person" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Função */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Função
            </label>
            <div className="relative">
              <Icon name="badge" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={funcao}
                onChange={e => setFuncao(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm appearance-none"
              >
                {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
                placeholder="Mínimo 4 caracteres"
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Confirmar Senha
            </label>
            <div className="relative">
              <Icon name="lock_check" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Icon name="person_add" size={18} className="text-white" />
            {carregando ? "Cadastrando..." : "CADASTRAR"}
          </button>

          {/* Link login */}
          <p
            onClick={onIrLogin}
            className="text-center text-gray-400 text-sm cursor-pointer hover:underline"
          >
            Já tenho conta — Fazer login
          </p>
        </form>
      </div>
    </div>
  );
}
