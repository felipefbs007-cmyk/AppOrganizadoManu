import { getToken as getFCMToken, onMessage } from "firebase/messaging";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { messaging, db } from "./firebase.js";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function requestPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export async function getToken() {
  try {
    const permission = await requestPermission();
    if (permission !== "granted") return null;
    const token = await getFCMToken(messaging, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (err) {
    console.warn("FCM getToken error:", err.message);
    return null;
  }
}

export async function saveToken(userId, token) {
  if (!userId || !token) return;
  try {
    const existing = await getDocs(collection(db, "fcm_tokens"));
    const alreadySaved = existing.docs.some(
      (d) => d.data().token === token && d.data().userId === userId
    );
    if (alreadySaved) return;
    await addDoc(collection(db, "fcm_tokens"), {
      userId,
      token,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("saveToken error:", err.message);
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
