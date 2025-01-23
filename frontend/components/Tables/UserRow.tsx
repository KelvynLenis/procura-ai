'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useEffect, useState } from "react";
import { DeviceProps } from "@/utils/types";
import ClipLoader from 'react-spinners/ClipLoader';


interface UserRowProps {
  $id: string;
  name?: string;
  cpf?: string;
  email?: string;
  userId?: string
}

export function UserRow({ user }: { user: UserRowProps }) {
  const [devices, setDevices] = useState<DeviceProps[]>([] as DeviceProps[]);
  const [isLoading, setIsLoading] = useState(true)

  console.log(user)


  async function buildParams() {
    const userId = user.userId
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
  }, []);

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger isChevronUpDown>
            <div className="flex w-full justify-around items-center font-normal">
              <span className="w-[40%] text-center">{user.$id}</span>
              <span className="text-center w-[25%]">{user.name || "N/A"}</span>
              <span className="text-center w-[25%]">{user.email || "N/A"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="gap-4 flex flex-col">
            <div className="flex w-full bg-zinc-300 px-10 py-2 font-medium">
              Dados pessoais
            </div>

            <div className="flex px-10 w-full justify-around">
              <div className="flex flex-col gap-2">
                <span className="font-medium uppercase">cpf</span>
                <span>{user.cpf}</span>
              </div>

              {/* <div className="flex flex-col gap-2">
                <span className="font-medium">Endereço</span>
                <span>endereço</span>
              </div> */}

              <div className="flex flex-col gap-2">
                <span className="font-medium">Email</span>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex w-full bg-zinc-300 px-10 py-2 font-medium">
              Dispositivos
            </div>

            <div className="grid grid-cols-3 px-10 w-full">
              {
                isLoading ? (
                  <ClipLoader />
                ) : (
                  devices.length > 0 ? (
                    devices.map((device) => (
                      <div key={device.$id} className="flex flex-col text-center">
                        <span>{device.phone_model}</span>
                        <span>{device.brand}</span>
                      </div>
                    ))

                  ) : (
                    <span className="col-span-3 text-center">Nenhum dispositivo cadastrado</span>
                  )
                )
              }
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}