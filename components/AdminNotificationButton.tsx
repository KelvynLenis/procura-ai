"use client";

import { formatDateTime } from "@/lib/utils";
import { Bell, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import DeviceCheck from "../assets/icons/device-check.svg";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationProps } from "@/types";

interface AdminNotificationButtonProps {
  notifications: NotificationProps[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationProps[]>>;
  onNotificationClick?: (notification: NotificationProps) => void;
}

export function AdminNotificationButton({
  notifications,
  setNotifications,
  onNotificationClick,
}: AdminNotificationButtonProps) {
  const [isListVisible, setIsListVisible] = useState(false);

  const toggleList = () => setIsListVisible((prev) => !prev);

  // Ordenar por mais recente primeiro - evento mais recente no topo
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

  function handleNotificationClick(notification: NotificationProps) {
    if (notification.type === "Recuperado") return;

    // Fechar o dropdown antes de navegar
    setIsListVisible(false);

    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  }

  function handleCloseNotification(
    e: React.MouseEvent,
    notificationId: string,
  ) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));

    // Fechar o dropdown se não há mais notificações
    if (sortedNotifications.length === 1) {
      setIsListVisible(false);
    }
  }

  function renderNotification(notification: NotificationProps) {
    const isRecovered = notification.type === "Recuperado";

    return (
      <div key={notification.$id} className="w-full">
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={`py-3 w-full flex items-start flex-col gap-2 relative ${
            isRecovered ? "" : "hover:bg-zinc-50 cursor-pointer"
          }`}
          onClick={() => !isRecovered && handleNotificationClick(notification)}
        >
          <button
            onClick={(e) => handleCloseNotification(e, notification.$id)}
            className="absolute top-2 right-2 p-1 hover:bg-zinc-200 rounded-full transition-colors z-10"
            title="Fechar notificação"
          >
            <X size={16} />
          </button>

          <div className="w-full pr-8">
            <h1 className="font-bold text-sm">Novo {notification.type}</h1>
            <p className="text-sm text-gray-600 text-justify mt-1">
              <span className="font-semibold">Descrição: </span>
              {notification.description}
            </p>
            <span className="text-xs text-zinc-500 mt-2 block">
              {formatDateTime(notification.time_event)}
            </span>

            {!isRecovered && (
              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                Clique para ver detalhes
                <ChevronRight size={12} />
              </div>
            )}
          </div>
        </DropdownMenuItem>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isListVisible} onOpenChange={toggleList}>
        <DropdownMenuTrigger className="relative bg-procura-ai-white p-2 rounded-full hover:bg-procura-ai-blue hover:ring-1 hover:ring-procura-ai-white hover:text-white transition-all duration-500">
          <Bell className="size-7" />
          {sortedNotifications.length > 0 && (
            <span className="bg-secondary text-white rounded-full w-6 h-6 font-bold flex items-center justify-center absolute -top-1 right-3">
              {sortedNotifications.length}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white shadow-lg rounded-md w-80 border">
          <div className="p-2 text-gray-700 font-semibold border-b w-full flex justify-between items-center">
            Notificações
            <button onClick={toggleList} type="button">
              <X className="ml-2" size={24} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto flex flex-col items-center justify-center py-2 px-2">
            {/* <div className='w-full flex h-full px-5 py-3 rounded-lg bg-blue-100/40 gap-4'>
                <Image src={DeviceCheck} alt="device-check" className="w-6 h-6 self-center" />
                <div className='flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <h1 className='font-bold text-sm text-primary'>Seu dispositivo foi recuperado</h1>
                    
                    <span className='w-2 h-2 rounded-full bg-[#004EC1]'></span>
                  </div>
                  <p className='text-sm'>
                    Informamos que o seu dispositivo  Redmi Note 7, registrado como roubado foi localizado e recuperado pela polícia. 
                    Acompanhe todas as atualizações desta ocorrência na página de recuperação.
                  </p>
                  <span className='text-xs'>
                    Hoje - 06/05/2025
                  </span>

                  <span className='text-primary flex self-end text-sm underline'>
                    Acompanhar atualizações
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div> */}
            {sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification) =>
                renderNotification(notification),
              )
            ) : (
              <p className="p-3 text-gray-500 text-sm">Nenhuma notificação</p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
