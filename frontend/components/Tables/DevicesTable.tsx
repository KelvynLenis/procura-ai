'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DeviceRow } from "./DeviceRow"
import { useEffect, useState } from "react"
import { DeviceProps } from "@/utils/types"
import { account } from "@/lib/appwrite"
import Button from "../Button"
import Link from "next/link"

export function DevicesTable() {
  const [devices, setDevices] = useState<DeviceProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function getUserId() {
    const { $id: userId } = await account.get();
    return userId;
  }

  function showLoadingToast() {
    setIsLoading(true)
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
        setDevices(result.documents || []);
      } catch (err) {
        console.error(`Fetch error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [setDevices]);

  return (
    <Table className="bg-white shadow-lg rounded-lg self-center">
      <TableHeader className="bg-zinc-200/60">
        <TableRow>
          <TableHead className="text-black/80 pl-5 font-semibold hidden lg:table-cell w-20">ID</TableHead>
          <TableHead className="text-black/80 font-semibold flex w-28 sm:justify-center md:flex items-center">Modelo</TableHead>
          <TableHead className="text-black/80 font-semibold hidden md:table-cell w-1/3">Marca</TableHead>
          <TableHead className="text-black/80 font-semibold hidden md:table-cell lg:w-full">IMEI</TableHead>
          <TableHead className="text-black/80 font-semibold w-24 text-center">Status</TableHead>
          <TableHead className="text-black/80 w-20 font-semibold text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="hidden lg:table-cell">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-20" />
            </TableCell>

            <TableCell className=" flex flex-col items-center gap-0.5">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </TableCell>
          </TableRow>
        ) : devices.length > 0 ? (
          devices.map((device, index) => (
            <DeviceRow
              key={device.$id}
              index={index}
              id={device.$id}
              phone_number={device.phone_number}
              phone_model={device.phone_model}
              brand={device.brand}
              imei={device.imei}
              isStolen={device.isStolen!}
              setDevices={setDevices}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Nenhum dispositivo cadastrado.
            </TableCell>
          </TableRow>
        )}
        <TableRow>
          <TableCell className="w-2/5" colSpan={2}>
            <Link href={'/cadastrar-dispositivo'}>
              <Button onClick={showLoadingToast} variant="blue" className="self-end w-44 my-3">Cadastrar dispositivo</Button>
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table >
  )
}
