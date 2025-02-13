'use client'

import { useEffect, useState } from "react";
import { DeviceProps } from "@/utils/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";


interface UserRowProps {
  $id?: string;
  name?: string;
  cpf?: string;
  email?: string;
  user_id?: string;
  type?: string;
}

export function UserRow({ user, index }: { user: UserRowProps, index: number }) {
  const [devices, setDevices] = useState<DeviceProps[]>([] as DeviceProps[]);
  const [isLoading, setIsLoading] = useState(true)
  const [color, setColor] = useState('')

  async function buildParams() {
    const userId = user.user_id
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: "equal",
        attribute: "auth_id",
        values: [userId],
      }),
    });
    return params;
  }

  useEffect(() => {
    const getDevices = async () => {
      setIsLoading(true)
      try {
        const params = await buildParams();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Error: ${error}`);
        }

        const result = await response.json();

        console.log(result.documents)
        setDevices(result.documents || []);
      } catch (err) {
        console.error(`Fetch error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();

    getRandomProfileColor()
  }, []);

  function getRandomProfileColor() {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFC300",
      "#A833FF", "#33FFF6", "#FF8C33", "#57FF33", "#33A8FF"
    ];

    setColor(colors[Math.floor(Math.random() * colors.length)])
  }

  return (
    <>
      <TableRow>
        <TableCell className="text-center py-8">{index}</TableCell>
        <TableCell className="break-words">
          <div className="flex  items-center">

            <span className={cn("text-xl text-white font-bold uppercase rounded-full w-10 h-10 px-1 flex items-center justify-center mr-3 bg-procura-ai-blue")}>
              {user.name!.split(" ").length > 1 ? user.name!.split(" ")[0][0] + user.name!.split(" ")[1][0] : user.name!.split(" ")[0][0]}
            </span>
            <span className="text-lg font-bold">
              {user.name || "N/A"}

            </span>
          </div>
        </TableCell>
        <TableCell className="font-bold text-lg break-words">{user.email || "N/A"}</TableCell>
        <TableCell className={cn("font-bold break-words")}>
          <span className={cn("font-bold text-lg break-words p-2 rounded-md capitalize", user.type === 'Usuario' ? 'bg-sky-400/40 text-sky-700' : 'bg-blue-500/30 text-blue-700')}>
            {user.type || "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-lg w-10 h-10 flex ring-1 ring-zinc-300 group relative hover:bg-sky-100 hover:ring-blue-700 hover:text-blue-900 items-center justify-center hover:opacity-90">
                <Eye size={26} />
                <span className="hidden opacity-0 group-hover:block group-hover:opacity-100 bg-black/60 w-36 rounded-sm absolute -top-8 right-5 py-1 text-white transition- duration-300">
                  Exibir informações
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="flex flex-col py-10 gap-10">
              <DialogHeader>
                <DialogTitle>Detalhes do usuários</DialogTitle>
              </DialogHeader>

              <div className="flex gap-8">
                <span className={cn("text-3xl text-white capitalize font-bold rounded-full w-14 h-14 px-1 flex items-center justify-center mr-3 bg-procura-ai-blue")}>
                  {user.name!.split(" ").length > 1 ? user.name!.split(" ")[0][0] + user.name!.split(" ")[1][0] : user.name!.split(" ")[0][0]}
                </span>

                <div className="flex flex-col items-start justify-center">
                  <span className="font-bold">Nome completo</span>
                  <span className="break-words">{user.name}</span>
                </div>

                <div className="flex flex-col items-start justify-center">
                  <span className="font-bold">Email</span>
                  <span>{user.email}</span>
                </div>

                <div className="flex flex-col gap-2 items-center justify-start">
                  <span className="font-bold">CPF</span>
                  <span>{user.cpf}</span>
                </div>

              </div>

              <div className="flex flex-col">
                <span className="font-bold">Dispositivos</span>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">IMEI</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead className="text-right">Número</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                      devices.map((device, index) => (

                        <TableRow key={index}>
                          <TableCell className="font-medium">{device.imei}</TableCell>
                          <TableCell className="capitalize">{device.brand}</TableCell>
                          <TableCell className="capitalize">{device.phone_model}</TableCell>
                          <TableCell className="text-right">{device.phone_number}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>

            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow >

    </>
  )
}