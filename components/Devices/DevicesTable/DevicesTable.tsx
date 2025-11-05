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
      <Table className="self-center rounded-xl bg-white shadow-lg">
        <TableHeader className="rounded-xl bg-secondary/10">
          <TableRow>
            <TableHead className="hidden pl-5 text-lg font-medium text-black/80 lg:table-cell lg:w-1/12">
              ID
            </TableHead>
            <TableHead className="flex w-28 items-end text-lg font-medium text-black/80 md:flex lg:table-cell lg:w-48">
              Modelo
            </TableHead>
            <TableHead className="hidden text-lg font-medium text-black/80 md:table-cell lg:w-32">
              Fabricante
            </TableHead>
            <TableHead className="hidden text-lg font-medium text-black/80 md:table-cell lg:w-1/4">
              IMEI
            </TableHead>
            <TableHead className="w-32 text-lg font-medium text-black/80 md:flex lg:w-36">
              Status
            </TableHead>
            <TableHead className="w-20 text-lg font-medium text-black/80">
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

              <TableCell className="flex items-center gap-0.5">
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
