'use client'

import { account } from "@/lib/appwrite"
import { firebaseConfig } from "@/lib/firebase"
import { initializeApp } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export function Board() {
  const router = useRouter()

  async function logout() {
    await account.deleteSession('current')

    router.push('/')
  }

  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registrado com sucesso:", registration);
    })
    .catch((error) => {
      console.error("Erro ao registrar o Service Worker:", error);
    });

  return (
    <>
      <button onClick={logout} className="w-20 h-10 bg-red-500 text-white rounded-md absolute right-5 top-4 hover:opacity-70 drop-shadow-md">Log Out</button>
      <div className="w-full h-full flex justify-between">
        <div className="bg-zinc-200 w-1/3 h-96"></div>
        <div className="bg-zinc-200 w-3/5 h-96"></div>
      </div>
    </>
  )
}