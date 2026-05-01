export const MOTIVOS = [
  "Falha Mecânica",
  "Falha Elétrica",
  "Falta de Material",
  "Setup / Troca",
  "Ajuste Fino",
  "Outro",
];

export const CARGOS = [
  "Tecelão",
  "Ajudante",
  "Contramestre",
  "Tc Líder",
  "Supervisor",
];

export const TURMAS = ["Turma A", "Turma B", "Turma C"];

export const TURMAS_INFO = {
  "Turma A": { horario: "05:15 – 13:45" },
  "Turma B": { horario: "13:45 – 22:05" },
  "Turma C": { horario: "22:05 – 05:15" },
};

export const CORES_TURMA = {
  "Turma A": { bg: "bg-blue-900/30", border: "border-blue-700", text: "text-blue-400", dot: "bg-blue-400" },
  "Turma B": { bg: "bg-emerald-900/30", border: "border-emerald-700", text: "text-emerald-400", dot: "bg-emerald-400" },
  "Turma C": { bg: "bg-amber-900/30", border: "border-amber-700", text: "text-amber-400", dot: "bg-amber-400" },
};

// Cargos que podem ver o Painel e gerar PDF
export const CARGOS_PAINEL = ["Contramestre", "Tc Líder"];

// Cargos que podem editar, deletar e finalizar paradas
export const CARGOS_GESTAO = ["Contramestre", "Tc Líder", "Supervisor"];
