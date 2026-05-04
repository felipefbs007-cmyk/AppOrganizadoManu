import { useState, useEffect } from "react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBack(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBack) return null;

  return (
    <div className={`fixed top-14 left-0 right-0 z-[9998] px-4 py-2 text-center text-sm font-bold transition-all ${
      isOnline
        ? "bg-green-600 text-white"
        : "bg-amber-500 text-black"
    }`}>
      {isOnline
        ? "✅ Conexão restaurada — sincronizando dados..."
        : "⚠️ Você está offline — os dados serão salvos quando a conexão voltar"
      }
    </div>
  );
}