"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, SendHorizonal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Notification } from "@/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { getUserById } from "@/functions/user/get-user-by-id";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "O título é obrigatório.",
    })
    .max(65, "O título deve ter no máximo 65 caracteres"),
  description: z
    .string()
    .min(1, {
      message: "O corpo da notificação é obrigatória.",
    })
    .max(240, "O corpo da notificação deve ter no máximo 240 caracteres"),
});

interface NotificationRowProps {
  notification: Notification;
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  restoreNotification: ({
    is_all_users_checked,
    selected_targets,
    device_options,
    location_options,
  }: {
    is_all_users_checked: boolean;
    selected_targets: string[];
    device_options: string[];
    location_options: string[];
  }) => void;
}

function NotificationRow({
  notification,
  form,
  restoreNotification,
}: NotificationRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetsName, setTargetsName] = useState<string>("");

  function handleFillForm() {
    form.setValue("title", notification.title!);
    form.setValue("description", notification.message);

    restoreNotification({
      is_all_users_checked: notification.is_all_users_checked,
      selected_targets: notification.selected_targets,
      device_options: notification.device_options,
      location_options: notification.location_options,
    });

    window.scrollTo(0, 0);
  }

  async function getUserName(id: string) {
    const response = await getUserById(id);

    return response.name;
  }

  async function getTargetsName() {
    if (
      notification.selected_targets &&
      notification.selected_targets.length > 0
    ) {
      const names = await Promise.all(
        notification.selected_targets.map((id) => getUserName(id)),
      );

      names.length > 2 && names.slice(0, 2);

      const joinedNames =
        names.length > 2
          ? `${names[0]}, ${names[1]} e ${names.length - 2} outros`
          : names.join(", ");

      setTargetsName(joinedNames);
      return joinedNames;
    } else {
      setTargetsName("Nenhum usuário selecionado");
      return "Nenhum usuário selecionado";
    }
  }

  useEffect(() => {
    getTargetsName();
  }, []);

  return (
    <TableRow>
      <TableCell className="max-w-36 py-8 text-center font-bold">
        {notification.title}
      </TableCell>
      <TableCell className="max-w-72 break-words">
        <div className="flex items-center font-medium">
          {notification.message}
        </div>
      </TableCell>
      <TableCell className="max-w-44 break-words font-medium">
        {notification.is_all_users_checked
          ? "Todos os usuários"
          : `Usuários: ${targetsName}. `}
        {!notification.is_all_users_checked &&
          notification.device_options &&
          notification.device_options?.length > 0 &&
          `Portadores de dispositivos: ${notification.device_options?.join(", ")}`}
      </TableCell>
      <TableCell className={cn("break-words font-medium")}>
        {formatDateTime(notification.$createdAt!)}
      </TableCell>
      <TableCell className="m-0 w-28 p-0">
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                disabled
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700 disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:hover:ring-zinc-300"
              >
                <Pencil size={26} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100 group-disabled:group-hover:hidden">
                  Editar contato
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-xl p-0">
              <DialogHeader className="bg-secondary/10 p-2">
                <DialogTitle className="w-full text-left text-secondary">
                  Editar contato
                </DialogTitle>
                <DialogDescription className="text-secondary"></DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <button
            type="button"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
            onClick={handleFillForm}
          >
            <SendHorizonal size={26} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default NotificationRow;
