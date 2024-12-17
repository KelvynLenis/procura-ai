'use client'

import { databases } from "@/lib/appwrite";
import { useEffect, useState } from "react"
import { Device } from "./Device";
import { Device as DeviceProps } from "@/utils/types";
import { Query } from "appwrite";

export function DevicesList() {
  const [devices, setDevices] = useState<DeviceProps[]>([])

  useEffect(() => {
    const getDevices = async () => {
      let promise = await databases.listDocuments(
        "673f3e7f002ac721c7f6",
        "673f3e8a0001a6d9233f",
        [
          Query.equal('userId', 'current()')
        ]
      );

      console.log(promise.documents)

      setDevices(promise.documents)
    }

    getDevices()

  }, [])

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