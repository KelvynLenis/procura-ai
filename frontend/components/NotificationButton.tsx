'use client'

import { client } from "@/lib/appwrite";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationButton() {
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [toggleNotificationsList, setToggleNotificationsList] = useState(false)
  const [filteredNotifications, setFilteredNotifications] = useState([])

  client.subscribe("documents", response => {
    if (response.payload.isStolen === true) {
      notifications.map(notification => {
        if (notification.$id === response.payload.$id) {
          return
        }
      })
      setNotifications(prevNotifications => [...prevNotifications, response.payload])
      setNotificationsCount(notificationsCount + 1)
      console.log(response.payload);
    }
  });

  function handleToggle() {
    // setNotifications([... new Set(notifications)])
    setToggleNotificationsList(!toggleNotificationsList)
  }

  useEffect(() => {
    setFilteredNotifications([... new Set(notifications)])
  }, [notifications])

  return (
    <>
      <button className="absolute right-10 top-5" onClick={handleToggle}>
        <Bell className="size-7" />
        {
          filteredNotifications.length > 0 ? (
            <span className="bg-red-500 text-white rounded-full w-6 font-bold flex items-center justify-center absolute -top-1 right-3">
              {notificationsCount}
            </span>
          ) : null
        }
        {
          toggleNotificationsList ? (
            <div className="absolute right-1 top-9 bg-white shadow-lg rounded-md">
              {
                filteredNotifications.map(notification => (
                  <div key={notification.$id} className="p-2 border-b">
                    <h1>{notification.brand}</h1>
                  </div>
                ))
              }
            </div>
          ) : null
        }
      </button>

    </>
  )
}