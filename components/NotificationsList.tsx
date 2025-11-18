"use client";

import { getDeviceById } from "@/functions/device/get-device-by-id";
import { getEventById } from "@/functions/event/get-event-by-id";
import { getNotifications } from "@/functions/notification/get-notifications";
import { getNotificationsRead } from "@/functions/notification/get-notifications-read";
import { getNotificationsUnread } from "@/functions/notification/get-notifications-unread";
import { markNotificationsAsRead } from "@/functions/notification/mark-as-read";
import { account } from "@/lib/appwrite";
import { cn, formatDateTime } from "@/lib/utils";
import { Device, Notification } from "@/types";
import { Check, CheckCircle, ChevronRight, Mail, MailOpen } from "lucide-react";
import React, { useEffect, useState } from "react";

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<
    Notification[]
  >([]);
  const [readNotifications, setReadNotifications] = useState<Notification[]>(
    [],
  );
  const [refetch, setRefetch] = useState(false);

  async function refresh() {
    setRefetch(!refetch);
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = await account.get();

      const notifications = await getNotifications(user.$id);

      const { documents: unreadNotifications } = await getNotificationsUnread(
        user.$id,
      );
      const { documents: readNotifications } = await getNotificationsRead(
        user.$id,
      );

      // const filteredNotifications = notifications.map((notification) => ({
      //   ...notification,
      //   time_event: new Date(notification.$createdAt!),
      // }));

      // const hoursAgo = 24 * 60 * 60 * 1000;

      // const newNotificationsSplit = filteredNotifications.filter(
      //   (notification) =>
      //     notification.time_event > new Date(Date.now() - hoursAgo),
      // );
      // const readNotificationsSplit = filteredNotifications.filter(
      //   (notification) =>
      //     notification.time_event < new Date(Date.now() - hoursAgo),
      // );

      // const newNotifications = newNotificationsSplit.sort(
      //   (a, b) => b.time_event.getTime() - a.time_event.getTime(),
      // );
      // const readNotifications = readNotificationsSplit.sort(
      //   (a, b) => b.time_event.getTime() - a.time_event.getTime(),
      // );

      setUnreadNotifications(unreadNotifications);
      setReadNotifications(readNotifications);

      setNotifications(notifications);
    };

    fetchNotifications();
  }, [refetch]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 rounded-lg bg-white px-4 py-6">
      <h1 className="text-lg font-semibold">Notificação não lidas</h1>
      {unreadNotifications.length > 0 ? (
        unreadNotifications.map((notification) => (
          <NotificationItem
            key={notification.$id}
            notification={notification}
            isRead={notification.is_read}
            refresh={refresh}
          />
        ))
      ) : (
        <p className="self-center text-sm text-zinc-500">
          Nenhuma notificação recentes
        </p>
      )}
      <h1 className="text-lg font-semibold">Notificação lidas</h1>
      {readNotifications.length > 0 ? (
        readNotifications.map((notification) => (
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

  async function markAsRead() {
    await markNotificationsAsRead(notification.$id!);
    refresh();
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
      <div className="flex w-full flex-col gap-2">
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

        <div className="flex w-full justify-between gap-4">
          <div className="pt-2 text-sm italic text-zinc-400">
            {formatDateTime(notification.$createdAt!)}
          </div>
          <div>
            {notification.type !== "push" && (
              <button
                onClick={markAsReadAndRedirect}
                type="button"
                className="mt-2 flex self-end text-sm text-secondary underline hover:opacity-70"
              >
                ir para página de recuperação
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={markAsRead}
              type="button"
              className={cn(
                "mt-2 flex gap-1 self-end text-sm hover:opacity-70",
                notification.is_read ? "text-zinc-500" : "text-secondary",
              )}
              title="Marcar como lido"
            >
              {notification.is_read ? (
                <div className="group flex gap-1">
                  Lido
                  <Mail className="hidden h-5 w-4 group-hover:block" />
                  <MailOpen className="h-4 w-4 group-hover:hidden" />
                </div>
              ) : (
                <div className="group flex gap-1">
                  Marcar como lido
                  <Mail className="h-5 w-4 group-hover:hidden" />
                  <MailOpen className="hidden h-4 w-4 group-hover:block" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
