"use client"

import { Device } from "@/utils/types";
import { usePathname, useRouter } from "next/navigation"

import { useEffect, useState } from "react";
import { DeviceForm } from "./Forms/DeviceForm";

export function Slug() {
    const router = usePathname().split("/")[3]
    console.log(router)
    const [device, setDevice] = useState<Device>({} as Device)

    useEffect(() => {
        const getDevice = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${router}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`
                        },
                    })

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Error: ${error}`);
                }

                const result = await response.json();
                setDevice(result);
            } catch (error) {
                console.error(`Fetch error: ${error}`);
            }

        }

        getDevice()

    }, [])

    return (
        <>
            <DeviceForm device={{
                $id:device.$id,
                phone_model: device.phone_model,
                phone_number: device.phone_number,
                brand: device.brand, imei: device.imei, latitude: device.latitude, longitude: device.longitude
            }} />



        </>
    )
}