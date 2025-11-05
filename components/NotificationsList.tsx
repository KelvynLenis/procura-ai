"use client";

import { getDeviceById } from "@/functions/device/get-device-by-id";
import { getEventById } from "@/functions/event/get-event-by-id";
import { getNotifications } from "@/functions/notification/get-notifications";
import { markNotificationsAsRead } from "@/functions/notification/mark-as-read";
import { account } from "@/lib/appwrite";
import { cn } from "@/lib/utils";
import { Device, Notification } from "@/types";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

interface NotitificationItemProps {
  isRead?: boolean;
  notification: Notification;
  refresh: () => void;
}

function NotificationItem({
  isRead,
  notification,
  refresh,
}: NotitificationItemProps) {
  const [device, setDevice] = useState<Device>();

  async function markAsReadAndRedirect() {
    await markNotificationsAsRead(notification.$id!);

    if (notification.type === "push") {
      refresh();
      return;
    }

    window.location.href = `/meus-dispositivos?id=${device?.$id}`;
  }

  useEffect(() => {
    const fetchDevice = async () => {
      if (notification.type !== "push") {
        const event = await getEventById(notification.event_id!);
        const device = await getDeviceById(event.id_device!);

        setDevice(device);
      }
    };

    fetchDevice();
  }, []);

  return (
    <div className="flex w-full gap-6 rounded-lg px-4 py-6 ring-1 ring-zinc-200">
      <span
        className={cn(
          "h-full w-2 rounded-lg",
          isRead ? "bg-zinc-400" : "bg-secondary",
        )}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">
          {notification.type === "push"
            ? notification.title
            : "Seu dispositivo foi recuperado"}
        </h1>
        <p className="text-sm">
          {notification.type === "push"
            ? notification.message
            : `Informamos que o seu dispositivo ${device?.phone_model}, foi localizado e recuperado pela polícia. Acompanhe todas as atualizações desta ocorrência na página de recuperação.`}
        </p>
        <button
          onClick={markAsReadAndRedirect}
          type="button"
          className="mt-2 flex self-end text-sm text-secondary underline"
        >
          ir para página de recuperação
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [NewNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [oldNotifications, setOldNotifications] = useState<Notification[]>([]);
  const [refetch, setRefetch] = useState(false);

  async function refresh() {
    setRefetch(!refetch);
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = await account.get();

      const notifications = await getNotifications(user.$id);

      const filteredNotifications = notifications.map((notification) => ({
        ...notification,
        time_event: new Date(notification.$createdAt!),
      }));

      const hoursAgo = 24 * 60 * 60 * 1000;

      const newNotificationsSplit = filteredNotifications.filter(
        (notification) =>
          notification.time_event > new Date(Date.now() - hoursAgo),
      );
      const oldNotificationsSplit = filteredNotifications.filter(
        (notification) =>
          notification.time_event < new Date(Date.now() - hoursAgo),
      );

      const newNotifications = newNotificationsSplit.sort(
        (a, b) => b.time_event.getTime() - a.time_event.getTime(),
      );
      const oldNotifications = oldNotificationsSplit.sort(
        (a, b) => b.time_event.getTime() - a.time_event.getTime(),
      );

      setNewNotifications(newNotifications);
      setOldNotifications(oldNotifications);

      setNotifications(notifications);
    };

    fetchNotifications();
  }, [refetch]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 rounded-lg bg-white px-4 py-6">
      <h1 className="text-lg font-semibold">Notificação em destaque</h1>
      {NewNotifications.length > 0 ? (
        NewNotifications.map((notification) => (
          <NotificationItem
            key={notification.$id}
            notification={notification}
            isRead={notification.is_read}
            refresh={refresh}
          />
        ))
      ) : (
        <p className="self-center text-sm text-zinc-500">
          Nenhuma notificação em destaque
        </p>
      )}
      <h1 className="text-lg font-semibold">Notificação anteriores</h1>
      {oldNotifications.length > 0 ? (
        oldNotifications.map((notification) => (
          <NotificationItem
            key={notification.$id}
            notification={notification}
            isRead={notification.is_read}
            refresh={refresh}
          />
        ))
      ) : (
        <p className="self-center text-sm text-zinc-500">
          Nenhuma notificação anteriores
        </p>
      )}
    </div>
  );
}
