"use client";

import { useEffect, useState } from "react";
import { Contact, type DeviceProps, type User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatDateTime } from "@/lib/utils";
import { toast } from "react-toastify";
import { deleteUser } from "@/functions/user/delete-user";
import { updateUserStatus } from "@/functions/user/update-user-status";
import { deleteUserSession } from "@/functions/user/delete-user";
import { listUserDevices } from "@/functions/device/list-user-devices";
import { ConfirmationDialog } from "../ConfirmationDialog";
import deviceInfo from "../../assets/icons/device-info.png";
import contactIcon from "../../assets/icons/contact-table-header.svg";
import Image from "next/image";
import { getOperator } from "@/functions/operators/get-operator";
import { listContacts } from "@/functions/contact/list-contacts";

// interface User {
//   $id: string
//   user_id: string
//   name?: string
//   cpf?: string
//   email?: string
//   type: string
//   status: string
//   accessed_at?: string
//   $createdAt?: string
//   img_url?: string
// }

interface UserRowProps {
  user: User;
  index: number;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export function UserRow({ user, index, setUsers }: UserRowProps) {
  const [devices, setDevices] = useState<DeviceProps[]>([] as DeviceProps[]);
  const [contacts, setContacts] = useState<Contact[]>([] as Contact[]);
  const [isLoading, setIsLoading] = useState(true);
  const [color, setColor] = useState("");

  async function buildParams() {
    const userId = user.user_id;
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "auth_id",
        values: [userId],
      }),
    });
    return params;
  }

  async function handleDeleteUser(userAuthid: string, userDocumentId: string) {
    try {
      await deleteUser(userAuthid, userDocumentId);

      setUsers((prevUsers) =>
        prevUsers.filter((prevUser) => prevUser.$id !== userDocumentId),
      );
      toast.success("Usuário deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar usuário. Tente novamente.");
      console.error("Erro ao deletar usuário:", error);
    }
  }

  async function handleDeactivateUser() {
    try {
      const newStatus = user.status === "Ativo" ? "Inativo" : "Ativo";

      const updatedUser = await updateUserStatus(user.$id, {
        status: newStatus,
      });

      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((prevUser) => {
            if (prevUser.$id === user.$id) {
              return {
                ...prevUser,
                status: newStatus,
              };
            }
            return prevUser;
          }),
        );

        try {
          await deleteUserSession(user.user_id);
        } catch (error) {
          console.error("Erro ao deletar sessão do usuário:", error);
          // Não vamos interromper o fluxo se falhar ao deletar a sessão
        }

        toast.success(
          `Usuário ${newStatus === "Ativo" ? "ativado" : "desativado"} com sucesso!`,
        );
      }
    } catch (error) {
      toast.error(
        `Erro ao ${user.status === "Ativo" ? "desativar" : "ativar"} usuário. Tente novamente.`,
      );
      console.error(
        `Erro ao ${user.status === "Ativo" ? "desativar" : "ativar"} usuário:`,
        error,
      );
    }
  }

  async function fetchOperator(operatorId: string) {
    const operator = await getOperator(operatorId);

    return operator;
  }

  useEffect(() => {
    const getDevices = async () => {
      setIsLoading(true);
      try {
        const userDevices = await listUserDevices(user.user_id);
        setDevices(userDevices);
      } catch (error) {
        console.error("Erro ao buscar dispositivos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const getContacts = async () => {
      try {
        const contact = await listContacts({ userIdParam: user.user_id });
        if (contact) {
          setContacts(contact);
        }
      } catch (error) {
        console.error("Erro ao buscar contato:", error);
      }
    };

    getContacts();
    getDevices();
    getRandomProfileColor();
  }, [user.user_id]);

  function getRandomProfileColor() {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33A8",
      "#FFC300",
      "#A833FF",
      "#33FFF6",
      "#FF8C33",
      "#57FF33",
      "#33A8FF",
    ];

    setColor(colors[Math.floor(Math.random() * colors.length)]);
  }

  const isUserActive = user.status === "Ativo";

  return (
    <>
      <TableRow>
        <TableCell className="py-8 text-center font-bold">
          {index + 1}
        </TableCell>
        <TableCell className="break-words">
          <div className="flex items-center">
            <span
              className={cn(
                "mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-procura-ai-blue px-1 text-xl font-bold uppercase text-white",
              )}
            >
              {user.name!.split(" ").length > 1
                ? user.name!.split(" ")[0][0] + user.name!.split(" ")[1][0]
                : user.name!.split(" ")[0][0]}
            </span>
            <span className="text-lg font-bold">{user.name || "N/A"}</span>
          </div>
        </TableCell>
        <TableCell className="break-words text-lg font-bold">
          {user.email || "N/A"}
        </TableCell>
        <TableCell className={cn("break-words font-bold")}>
          <span
            className={cn(
              "break-words rounded-md p-2 text-lg font-bold capitalize",
              user.type === "Usuario"
                ? "bg-sky-400/40 text-sky-700"
                : "bg-purple-500/35 text-purple-800",
            )}
          >
            {user.type === "Usuario" ? "Usuário" : user.type || "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-zinc-300 hover:bg-sky-100 hover:text-blue-900 hover:opacity-90 hover:ring-blue-700"
                >
                  <Eye size={26} />
                  <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                    Exibir informações
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[75%] w-[65%] flex-col gap-5 p-0">
                <DialogHeader className="rounded-md bg-sky-100/40 px-6 py-5 text-xl text-procura-ai-blue">
                  <DialogTitle>Detalhes do usuários</DialogTitle>
                </DialogHeader>

                <div className="custom-scroll flex flex-col gap-4 overflow-y-scroll px-4 pb-4">
                  <div className="flex flex-col">
                    <div className="flex w-full items-center gap-2 rounded-t-lg border-zinc-200 bg-zinc-100 px-4 py-2 text-lg font-medium">
                      {user.img_url ? (
                        <Image
                          src={user.img_url}
                          width={48}
                          height={48}
                          alt="device-info"
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-procura-ai-blue text-white">
                          {user.name!.split(" ").length > 1
                            ? user.name!.split(" ")[0][0] +
                              user.name!.split(" ")[1][0]
                            : user.name!.split(" ")[0][0]}
                        </div>
                      )}
                      Dados pessoais
                    </div>
                    <div className="flex flex-col gap-2 rounded-b-3xl border border-zinc-200 p-4 drop-shadow-sm">
                      <div className="flex">
                        <span className="w-44 font-medium">Nome</span>
                        <span className="w-full">{user.name}</span>
                      </div>
                      <div className="flex">
                        <span className="w-44 font-medium">CPF</span>
                        <span className="w-full">{user.cpf}</span>
                      </div>
                      <div className="flex">
                        <span className="w-44 font-medium">E-mail</span>
                        <span className="w-full">{user.email}</span>
                      </div>
                      <div className="flex">
                        <span className="w-44 font-medium">Último acesso</span>
                        <span className="w-full">
                          {user.accessed_at
                            ? formatDateTime(user.accessed_at)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-44 font-medium">Registrado em</span>
                        <span className="w-full">
                          {user.$createdAt
                            ? formatDateTime(user.$createdAt)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex w-full items-center gap-2 rounded-t-lg border-zinc-200 bg-zinc-100 px-4 py-2">
                      <Image
                        src={deviceInfo}
                        alt="device-info"
                        className="h-10 w-10"
                      />
                      <span className="text-lg font-medium text-procura-ai-zinc">
                        Dispositivos
                      </span>
                    </div>
                    <div className="rounded-b-lg border">
                      <Table>
                        <TableHeader className="border-t border-zinc-200 bg-zinc-100">
                          <TableRow>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Número
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Operadora
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Fabricante
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Modelo
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              IMEI
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devices.length > 0 ? (
                            devices.map((device, index) => (
                              <TableRow key={index}>
                                <TableCell className="">
                                  {`(${device.phone_number.slice(0, 2)}) ${device.phone_number.slice(2, 7)}-${device.phone_number.slice(7, 11)}`}
                                </TableCell>
                                <TableCell className="">
                                  {device.operator_id
                                    ? fetchOperator(device.operator_id).then(
                                        (operator) => operator?.name_operator,
                                      )
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {device.brand}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {device.phone_model}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {device.imei}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <span
                                    className={cn(
                                      "flex w-fit items-center justify-center rounded-sm",
                                      device.status === "Roubado" &&
                                        "bg-robbery-bg px-3 py-1 text-red-600 ring-red-500",
                                      device.status === "Furtado" &&
                                        "bg-theft-bg px-3 py-1 text-orange-600 ring-orange-500",
                                      device.status === "Perdido" &&
                                        "bg-lost-bg px-3 py-1 text-yellow-600 ring-yellow-500",
                                      device.status === "Recuperado" &&
                                        "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                                      device.status === "Regular" &&
                                        "bg-lime-500/30 px-3 py-1 text-lime-600 ring-lime-500",
                                      device.status === "Solicitado" &&
                                        "bg-requested-bg text-requested-text p-1",
                                    )}
                                  >
                                    {device.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">
                                Nenhum dispositivo cadastrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex w-full items-center gap-2 rounded-t-lg border-zinc-200 bg-zinc-100 px-4 py-2">
                      <Image
                        src={contactIcon}
                        alt="device-info"
                        className="h-10 w-10"
                      />
                      <span className="text-lg font-medium text-procura-ai-zinc">
                        Contatos de confiança
                      </span>
                    </div>
                    <div className="rounded-b-lg border">
                      <Table>
                        <TableHeader className="border-t border-zinc-200 bg-zinc-100">
                          <TableRow>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Nome
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              E-mail
                            </TableHead>
                            <TableHead className="font-medium text-procura-ai-zinc">
                              Número
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.length > 0 ? (
                            contacts.map((contact, index) => (
                              <TableRow key={index}>
                                <TableCell className="capitalize">
                                  {contact.name_contact
                                    ? contact.name_contact
                                    : "Não Informado"}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {contact.email_contact
                                    ? contact.email_contact
                                    : "Não Informado"}
                                </TableCell>
                                <TableCell className="">
                                  {`(${contact.number_contact.slice(0, 2)}) ${contact.number_contact.slice(2, 7)}-${contact.number_contact.slice(7, 11)}`
                                    ? `(${contact.number_contact.slice(0, 2)}) ${contact.number_contact.slice(2, 7)}-${contact.number_contact.slice(7, 11)}`
                                    : "Não Informado"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">
                                Nenhum contato cadastrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ConfirmationDialog
              title={
                isUserActive
                  ? "Tem certeza que deseja desativar o usuário?"
                  : "Tem certeza que deseja ativar o usuário?"
              }
              description={
                isUserActive
                  ? "Os dados do usuáiro permaneceram na base de dados, entretanto seu acesso será revogado."
                  : "O acesso do usuário será restaurado."
              }
              onConfirm={handleDeactivateUser}
            >
              <button
                type="button"
                className={cn(
                  "group relative flex h-10 w-10 items-center justify-center rounded-lg p-1 ring-1 hover:opacity-90",
                  isUserActive
                    ? "text-orange-600 ring-zinc-300 hover:bg-orange-100 hover:text-orange-700 hover:ring-orange-600"
                    : "bg-orange-100 text-orange-600 ring-orange-600 hover:text-orange-500 hover:ring-orange-300",
                )}
              >
                <UserX size={26} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                  {isUserActive ? "Desativar usuário" : "Ativar usuário"}
                </span>
              </button>
            </ConfirmationDialog>

            <ConfirmationDialog
              title="Tem certeza que deseja excluir o usuário?"
              description="Os dados do usuário serão excluídos permanentemente, entretanto seu histórico de alertas será mantido."
              onConfirm={() => handleDeleteUser(user.user_id!, user.$id!)}
            >
              <button
                type="button"
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-red-600 ring-1 ring-zinc-300 hover:bg-red-200 hover:text-red-700 hover:opacity-90 hover:ring-red-600"
              >
                <Trash2 size={26} />
                <span className="transition- absolute -top-8 right-5 hidden w-36 rounded-sm bg-black/60 py-1 text-white opacity-0 duration-300 group-hover:block group-hover:opacity-100">
                  Excluir usuário
                </span>
              </button>
            </ConfirmationDialog>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
