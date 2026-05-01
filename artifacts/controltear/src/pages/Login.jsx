import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { CARGOS } from "../constants.js";
import Icon from "../components/Icon.jsx";

export default function Login() {
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return setError("Informe seu nome.");
    if (!cargo) return setError("Selecione seu cargo.");
    setError("");
    login(nome.trim(), cargo);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
            <Icon name="factory" size={32} className="text-white" filled />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ControlTear</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de Paradas de Produção</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                text-sm transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block">
              Cargo
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                text-sm transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione seu cargo</option>
              {CARGOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              <Icon name="error" size={16} filled />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
