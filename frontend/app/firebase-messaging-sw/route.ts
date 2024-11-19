import { initializeApp } from "firebase/app";
import { getToken } from "firebase/messaging";
import { getMessaging } from "firebase/messaging/sw";

export async function GET(req: Request) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);

  const messaging = getMessaging(app);

  Notification.requestPermission()
    .then((permission) => {
      if (permission === "granted") {
        return getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });
      } else {
        console.error("Permissão negada para notificações push.");
      }
    })
    .then((deviceToken) => {
      console.log("Device Token gerado:", deviceToken);
      // Salvar o token no backend para associar ao usuário
    })
    .catch((err) => {
      console.error("Erro ao obter o Device Token:", err);
    });

}