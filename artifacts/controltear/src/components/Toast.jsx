import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

const toastTypes = {
  success: { icon: "check_circle", color: "text-emerald-400", bg: "bg-emerald-950 border-emerald-800" },
  error: { icon: "error", color: "text-red-400", bg: "bg-red-950 border-red-800" },
  info: { icon: "info", color: "text-blue-400", bg: "bg-blue-950 border-blue-800" },
  warning: { icon: "warning", color: "text-amber-400", bg: "bg-amber-950 border-amber-800" },
};

export default function Toast({ message, type = "info", onClose, duration = 3500 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const { icon, color, bg } = toastTypes[type] || toastTypes.info;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl
        transition-all duration-300 ${bg}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ minWidth: 260, maxWidth: 380 }}
    >
      <Icon name={icon} className={color} size={20} filled />
      <span className="text-sm text-gray-100 flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

let globalAddToast = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    globalAddToast = (msg, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, msg, type }]);
    };
    return () => { globalAddToast = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.msg} type={t.type} onClose={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}

export function showToast(message, type = "info") {
  if (globalAddToast) globalAddToast(message, type);
}
