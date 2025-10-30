"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeviceProps } from "@/types";
import { DeviceRow } from "./DeviceRow";

interface DevicesTableProps {
  devices: DeviceProps[];
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  totalDevices: number;
  page: number;
  pages: number;
  limit: number;
  isLoading: boolean;
  deviceNotificationId?: string;
}

export function DevicesTable({
  devices,
  setDevices,
  totalDevices,
  page,
  pages,
  limit,
  isLoading,
  deviceNotificationId,
}: DevicesTableProps) {
  return (
    <>
      <Table className="bg-white shadow-lg rounded-xl self-center">
        <TableHeader className="bg-secondary/10 rounded-xl">
          <TableRow>
            <TableHead className="text-black/80 text-lg pl-5 font-medium hidden lg:table-cell lg:w-1/12">
              ID
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium flex w-28 md:flex lg:table-cell lg:w-48 items-end">
              Modelo
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium hidden md:table-cell lg:w-32">
              Fabricante
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium hidden md:table-cell lg:w-1/4">
              IMEI
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium md:flex w-32 lg:w-36">
              Status
            </TableHead>
            <TableHead className="text-black/80 text-lg w-20 font-medium">
              Ações
            </TableHead>
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

              <TableCell className=" flex items-center gap-0.5">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </TableCell>
            </TableRow>
          ) : devices.length > 0 ? (
            devices.map((device, index) => (
              <DeviceRow
                // key={device.$id!}
                index={index + 1 * ((page - 1) * limit)}
                id={device.$id!}
                device={device}
                setDevices={setDevices}
                deviceNotificationId={deviceNotificationId}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum dispositivo cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
