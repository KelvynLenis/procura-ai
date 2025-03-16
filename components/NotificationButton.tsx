'use client'

import { client } from '@/lib/appwrite'
import { Bell } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

export function NotificationButton({
  notifications,
  setNotifications,
}: {
  notifications: never[]
  setNotifications: React.Dispatch<React.SetStateAction<never[]>>
}) {
  const [isListVisible, setIsListVisible] = useState(false)

  const handleNewNotification = useCallback(response => {
    const { payload } = response
    const isRelevant = [
      'Furto simples',
      'Extravio ou Perda',
      'Roubo',
      'Recuperado',
    ].includes(payload.type)
    if (isRelevant) {
      // if (payload?.type === "Furto simples" || payload?.type === "Extravio ou Perda" || payload?.type === "Roubo"|| payload?.type === "Recuperado") {
      setNotifications(prevNotifications => {
        const exists = prevNotifications.some(n => n.$id === payload.$id)
        return exists ? prevNotifications : [...prevNotifications, payload]
      })
    }
  }, [])

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}.documents`,
      handleNewNotification
    )

    return () => unsubscribe()
  }, [handleNewNotification])

  const toggleList = () => setIsListVisible(prev => !prev)

  // const filteredNotifications = notifications.filter(
  //   n => n.type !== 'Recuperado'
  // )

  return (
    <>
      <button
        className="absolute right-10 top-3 bg-procura-ai-white p-2 rounded-full hover:bg-procura-ai-blue hover:ring-1 hover:ring-procura-ai-white hover:text-white transition-all duration-500"
        onClick={toggleList}
      >
        <Bell className="size-7" />
        {filteredNotifications.length > 0 && (
          <span className="bg-red-500 text-white rounded-full w-6 h-6 font-bold flex items-center justify-center absolute -top-1 right-3">
            {filteredNotifications.length}
          </span>
        )}
      </button>
      {isListVisible && (
        <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-64 border z-100">
          <div className="p-2 text-gray-700 font-semibold border-b w-full flex justify-center">
            Notificações
          </div>
          <div className="max-h-60 overflow-y-auto flex flex-col items-center justify-center py-2 px-4">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.$id}
                  className="py-3 w-full hover:bg-zinc-100 flex items-center justify-center flex-col"
                >
                  <h1 className="font-bold">Novo {notification.type}</h1>
                  <p className="text-sm text-gray-600 text-justify">
                    <span className="font-semibold">Descrição: </span>
                    {notification.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-3 text-gray-500 text-sm">Nenhuma notificação</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
