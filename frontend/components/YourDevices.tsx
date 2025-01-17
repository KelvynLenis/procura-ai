"use client"

import { useEffect, useState } from "react"
import { Device } from "./Device";
import { Device as DeviceProps } from "@/utils/types";
import { account } from "@/lib/appwrite"
import Link from "next/link";
import Button from "./Button";
import Image from "next/image";
import woman from '../assets/images/woman-coffe.png'

export function YourDevices() {
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
    <div className="flex flex-col w-full items-center rounded-xl bg-white shadow pb-10">
      {

        devices.length === 0 ? (
          <div className="flex flex-col gap-4 h-full w-full justify-between">
            <div className="w-full self-start p-2 bg-blue-200/20 h-10 rounded-t-xl font-bold text-procura-ai-blue">
              Seus dispositivos
            </div>

            <div className="p-4 flex flex-col gap-4">
              <Image src={woman} alt="woman" className="w-56 self-center" />
              <span className="text-center">Você ainda não possui dispositivos cadastrados</span>

              <Link href={'/cadastrar-dispositivo'} className="self-end">
                <Button variant="blue" isLoader>
                  Cadastrar dispositivo
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* <div className="h-fit w-full flex flex-col gap-4 px-4 pt-4 relative"> */}
            <div className="w-full self-start p-2 bg-blue-200/20 h-10 rounded-t-xl font-bold text-procura-ai-blue">
              Seus dispositivos
            </div>
            <div className="z-10 flex flex-col h-96 w-full gap-3 px-4 py-1 overflow-y-scroll custom-scroll">
              {/* <Image src={DeviceBg} alt="dispositivos" className="w-screen left-0 top-0 h-full absolute z-0" /> */}
              {
                devices.map((device: DeviceProps) => (
                  <Device key={device.$id} {...device} />
                ))
              }
            </div>
          </>
        )
      }
    </div>
  )
}