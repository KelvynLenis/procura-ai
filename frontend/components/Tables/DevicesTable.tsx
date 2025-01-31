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
          <TableHead className="text-black/80 pl-5 w-20 font-semibold">ID</TableHead>
          <TableHead className="text-black/80 w-56 font-semibold">Modelo</TableHead>
          <TableHead className="text-black/80 font-semibold">Marca</TableHead>
          <TableHead className="text-black/80 font-semibold">IMEI</TableHead>
          <TableHead className="text-black/80 font-semibold">Status</TableHead>
          <TableHead className="w-20 font-semibold">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className=" flex flex-col gap-0.5">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-7 w-52" />
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
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell className="flex w-full">
            <Link href={'/cadastrar-dispositivo'}>
              <Button onClick={showLoadingToast} variant="blue" className="self-end w-44 my-3">Cadastrar dispositivo</Button>
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
