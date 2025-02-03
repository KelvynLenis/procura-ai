'use client'

import { client } from "@/lib/appwrite";
import { Bell } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export function NotificationButton() {
  const [notifications, setNotifications] = useState([]);
  const [isListVisible, setIsListVisible] = useState(false);

  const handleNewNotification = useCallback((response) => {
    const { payload } = response;

    if (payload?.type === "Furto simples" || payload?.type === "Extravio ou Perda") {
      setNotifications((prevNotifications) => {
        const exists = prevNotifications.some((n) => n.$id === payload.$id);
        return exists ? prevNotifications : [...prevNotifications, payload];
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}.documents`,
      handleNewNotification
    );

    return () => unsubscribe();
  }, [handleNewNotification]);

  const toggleList = () => setIsListVisible((prev) => !prev);

  return (
    <>

      <button className="absolute right-10 top-5" onClick={toggleList}>
        <Bell className="size-7" />
        {notifications.length > 0 && (
          <span className="bg-red-500 text-white rounded-full w-6 h-6 font-bold flex items-center justify-center absolute -top-1 right-3">
            {notifications.length}
          </span>
        )}

        {isListVisible && (
          <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-64 border">
            <div className="p-2 text-gray-700 font-semibold border-b">Notificações</div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.$id} className="p-3 border-b">
                    <h1 className="font-bold">Novo {notification.type}</h1>
                    <p className="text-sm text-gray-600">descrição: {notification.description}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-gray-500 text-sm">Nenhuma notificação</p>
              )}
            </div>
          </div>
        )}
      </button >
    </>
  );
}
