"use client"

import { useEffect, useState } from "react"
import { Device } from "./Device";
import { Device as DeviceProps } from "@/utils/types";
import { account } from "@/lib/appwrite"


export function DevicesList() {
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
        devices.map((device: DeviceProps) => (
          <Device key={device.$id} {...device} />
        ))
      }
    </>
  )
}