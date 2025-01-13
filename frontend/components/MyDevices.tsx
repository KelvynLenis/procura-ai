"use client"

import { useEffect, useState } from "react"
import { Device } from "./Device";
import { Device as DeviceProps } from "@/utils/types";
import { account } from "@/lib/appwrite"
import Link from "next/link";
import Button from "./Button";
import Image from "next/image";
import DeviceBg from '../assets/images/devices-bg.png'

export function MyDevices() {
  const [devices, setDevices] = useState<DeviceProps[]>([])

  async function getUserId() {
    const { $id: userId } = await account.get();
    return userId;
  }

  async function buildParams() {
    const userId = await getUserId();
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
      try {
        const params = await buildParams(); // Aguarda os parâmetros serem construídos
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
        setDevices(result.documents || []);
      } catch (err) {
        console.error(`Fetch error: ${err}`);
      }
    };

    getDevices();
  }, []);


  return (
    <>
      {

        devices.length === 0 ? (
          <div className="flex flex-col w-full h-screen items-center justify-center">
            <span className="text-center">Você ainda não possui dispositivos cadastrados</span>

            <Link href={'/cadastrar-dispositivo'}>
              <Button variant="white" isLoader>
                Cadastrar dispositivo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="h-fit w-full flex flex-col gap-4 px-4 pt-4 pb-8 relative">
              <Image src={DeviceBg} alt="dispositivos" className="w-screen left-0 top-0 h-full absolute z-0" />
              <div className="z-10 flex flex-col h-full gap-4">
                <span className="font-semibold text-xl">Meus dispositivos</span>
                {
                  devices.map((device: DeviceProps) => (
                    <Device key={device.$id} {...device} setDevices={setDevices}/>
                  ))
                }
              </div>
            </div>

            <span className="text-center font-medium py-10 text-xl">Outras ações</span>

            <div className="h-fit w-fit px-4 grid grid-cols-4 gap-4 text-xs self-center font-medium  items-center">
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end ">Cadastrar ocorrencia</button>
              <button className="mx-auto pb-3 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Bloquear apps bancários</button>
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Alertar autoridades</button>
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Contatos de confiança</button>

              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Cadastrar ocorrencia</button>
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Bloquear apps bancários</button>
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Alertar autoridades</button>
              <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Contatos de confiança</button>
            </div>
          </>
        )
      }
    </>
  )
}