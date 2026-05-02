import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const sendConfig = (sw) => {
      sw.postMessage({ type: "FIREBASE_CONFIG", config });
    };

    if (reg.active) {
      sendConfig(reg.active);
    }
    if (reg.installing) {
      reg.installing.addEventListener("statechange", (e) => {
        if (e.target.state === "activated") sendConfig(e.target);
      });
    }
    if (reg.waiting) {
      reg.waiting.addEventListener("statechange", (e) => {
        if (e.target.state === "activated") sendConfig(e.target);
      });
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (navigator.serviceWorker.controller) {
        sendConfig(navigator.serviceWorker.controller);
      }
    });
  } catch (err) {
    console.warn("Service Worker registration failed:", err.message);
  }
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
