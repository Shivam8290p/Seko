import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase config is missing. Create .env.local with the VITE_FIREBASE_* values " +
      "and RESTART `npm run dev` (Vite only reads env files at startup)."
  );
}

const app = initializeApp(firebaseConfig);

// Long polling works through ad-blockers, VPNs, proxies and school/office networks
// that break Firestore's default streaming connection (which makes writes hang).
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
