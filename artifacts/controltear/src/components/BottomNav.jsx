import Icon from "./Icon.jsx";

const navItems = [
  { label: "Nova", icon: "add_circle", page: "nova" },
  { label: "Lista", icon: "list_alt", page: "lista" },
  { label: "Painel", icon: "dashboard", page: "painel" },
];

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center gap-1 py-2 px-6 flex-1 transition-colors
                ${active ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Icon name={item.icon} size={24} filled={active} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
