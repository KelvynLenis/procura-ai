"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import DeviceCheck from "../assets/icons/device-check.svg";
import { Device, Notification, NotificationProps } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";
import { getDeviceById } from "@/functions/device/get-device-by-id";
import Link from "next/link";
import { getNotificationsUnread } from "@/functions/notification/get-notifications-unread";
import { account } from "@/lib/appwrite";
import { Skeleton } from "./ui/skeleton";
import { markNotificationsAsRead } from "@/functions/notification/mark-as-read";

function RenderNotification({
  notification,
}: {
  notification: NotificationProps;
}) {
  const isRecovered = notification.type === "Recuperado";
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        if (notification.type === "push") return;
        const device = await getDeviceById(notification.id_device!);
        setDevice(device);
      } catch (err) {
        console.error("Erro ao buscar device:", err);
      }
      setIsLoading(false);
    };
    fetchDevice();
  }, [notification.id_device]);

  return (
    <div key={notification.$id} className="w-full">
      <DropdownMenuSeparator />
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <DropdownMenuItem
          className={`relative flex w-full flex-col items-start gap-2 py-3 ${
            isRecovered ? "" : "cursor-pointer hover:bg-zinc-50"
          }`}
          // onClick={() => !isRecovered && handleNotificationClick(notification)}
        >
          <div className="flex h-full w-full gap-4 rounded-lg bg-blue-100/40 px-5 py-3">
            <Image
              src={DeviceCheck}
              alt="device-check"
              className="h-6 w-6 self-center"
            />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-bold text-primary">
                  Seu dispositivo foi recuperado
                </h1>

                <span className="h-2 w-2 rounded-full bg-[#004EC1]"></span>
              </div>
              <p className="text-sm">
                Informamos que o seu dispositivo {device?.phone_model},{" "}
                <strong className="font-semibold">
                  foi localizado e recuperado pela polícia.
                </strong>
                Acompanhe todas as atualizações desta ocorrência na página de
                recuperação.
              </p>
              <span className="text-xs">
                {formatDateTime(notification.time_event)}
              </span>

              <span className="flex self-end text-sm text-primary underline">
                Acompanhar atualizações
                <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </DropdownMenuItem>
      )}
    </div>
  );
}

function PreviousNotification({
  notification,
}: {
  notification: Notification;
}) {
  const isRecovered = notification.type === "Recuperado";
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState(true);

  async function markAsReadAndRedirect() {
    await markNotificationsAsRead(notification.$id!);

    if (notification.type === "push") {
      window.location.href = `/notificacoes`;
      return;
    }

    window.location.href = `/meus-dispositivos?id=${device?.$id}`;
  }

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        if (notification.type === "push") {
          setIsLoading(false);
          return;
        }
        const device = await getDeviceById(notification.id_device!);
        setDevice(device);
      } catch (err) {
        console.error("Erro ao buscar device:", err);
      }
      setIsLoading(false);
    };
    fetchDevice();
  }, [notification.id_device]);

  return (
    <div key={notification.$id} className="w-full">
      <DropdownMenuSeparator />
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <DropdownMenuItem
          className={`relative flex w-full flex-col items-start gap-2 py-3 ${
            isRecovered ? "" : "cursor-pointer hover:bg-zinc-50"
          }`}
          // onClick={() => !isRecovered && handleNotificationClick(notification)}
        >
          <div className="flex h-full w-full gap-4 rounded-lg bg-blue-100/40 px-5 py-3">
            <Image
              src={DeviceCheck}
              alt="device-check"
              className="h-6 w-6 self-center"
            />
            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-bold text-primary">
                  {notification.type === "push"
                    ? notification.title
                    : "Seu dispositivo foi recuperado"}
                </h1>

                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    notification.is_read ? "bg-zinc-400" : "bg-[#004EC1]",
                  )}
                ></span>
              </div>
              <p className="text-sm">
                {notification.type === "push" ? (
                  notification.message
                ) : (
                  <>
                    Informamos que o seu dispositivo {device?.phone_model},{" "}
                    <strong className="font-semibold">
                      foi localizado e recuperado pela polícia.
                    </strong>
                    Acompanhe todas as atualizações desta ocorrência na página
                    de recuperação.
                  </>
                )}
              </p>
              <span className="text-xs">
                {formatDateTime(notification.$createdAt!)}
              </span>

              <button
                onClick={markAsReadAndRedirect}
                type="button"
                className="flex self-end text-sm text-secondary underline hover:opacity-70"
              >
                Acompanhar atualizações
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </DropdownMenuItem>
      )}
    </div>
  );
}

interface ClientNotificationButtonProps {
  notifications: NotificationProps[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationProps[]>>;
  onNotificationClick?: (notification: NotificationProps) => void;
}

function ClientNotificationButton({
  notifications,
  setNotifications,
  onNotificationClick,
}: ClientNotificationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [previousNotifications, setPreviousNotifications] = useState<
    Notification[]
  >([]);

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.time_event).getTime();
    const dateB = new Date(b.time_event).getTime();

    // Debug: verificar ordenação
    console.log("NotificationButton: Ordenando notificações", {
      a: { id: a.$id.slice(0, 8), date: a.time_event, timestamp: dateA },
      b: { id: b.$id.slice(0, 8), date: b.time_event, timestamp: dateB },
      result: dateB - dateA,
    });

    // Retorna a diferença para ordenação decrescente (mais recente primeiro)
    return dateB - dateA;
  });

  useEffect(() => {
    const fetchNotificationsUnread = async () => {
      const user = await account.get();

      const { documents, total } = await getNotificationsUnread(user.$id);

      setPreviousNotifications(documents);
      setNotificationsCount(total);
    };

    fetchNotificationsUnread();
  }, [notifications]);

  // useEffect(() => {
  //   setNotificationsCount(notificationsCount + 1)
  // }, [notifications])

  return (
    <DropdownMenu open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenuTrigger className="relative rounded-full bg-procura-ai-white p-2 transition-all duration-500 hover:bg-procura-ai-blue hover:text-white hover:ring-1 hover:ring-procura-ai-white">
        <Bell className="size-7" />
        {notificationsCount > 0 && (
          <span className="absolute -top-1 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-bold text-white">
            {notificationsCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 rounded-md border bg-white shadow-lg">
        <div className="flex w-full items-center justify-between border-b p-2 font-semibold text-gray-700">
          Notificações
          <button type="button" onClick={() => setIsDialogOpen(false)}>
            <X className="ml-2" size={24} />
          </button>
        </div>
        <div className="flex max-h-96 flex-col overflow-y-auto px-2 py-2">
          {/* { sortedNotifications.length > 0 && previousNotifications.length > 0 && 
                <p className="p-3 text-gray-500 text-sm">Notificação mais recente</p>
              } */}
          {/* {sortedNotifications.length > 0 &&
                sortedNotifications.map(notification => <RenderNotification notification={notification} />)                 
              } */}

          {previousNotifications.length > 0 ? (
            previousNotifications.map((notification) => (
              <PreviousNotification notification={notification} />
            ))
          ) : (
            <p className="p-3 text-sm text-gray-500">
              Nenhuma notificação encontrada
            </p>
          )}

          <DropdownMenuItem className="w-full p-0">
            <Link
              href="/notificacoes"
              className="w-full p-2 text-center hover:bg-zinc-100"
            >
              Ver tudo
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ClientNotificationButton;
