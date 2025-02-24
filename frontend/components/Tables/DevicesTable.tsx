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
import { DeviceProps } from "@/utils/types"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"
import { DeviceRow } from "./DeviceRow";

interface DevicesTableProps {
  devices: DeviceProps[];
  setDevices: React.Dispatch<React.SetStateAction<DeviceProps[]>>;
  totalDevices: number;
  page: number;
  pages: number;
  limit: number;
  isLoading: boolean
}

export function DevicesTable({ devices, setDevices, totalDevices, page, pages, limit, isLoading }: DevicesTableProps) {

  return (
    <>
      <Table className="bg-white shadow-lg rounded-lg self-center">
        <TableHeader className="bg-zinc-200/60">
          <TableRow>
            <TableHead className="text-black/80 text-lg pl-5 font-medium hidden lg:table-cell lg:w-1/12">ID</TableHead>
            <TableHead className="text-black/80 text-lg font-medium flex w-28 md:flex lg:table-cell lg:w-48 items-end">Modelo</TableHead>
            <TableHead className="text-black/80 text-lg font-medium hidden md:table-cell lg:w-32">Marca</TableHead>
            <TableHead className="text-black/80 text-lg font-medium hidden md:table-cell lg:w-1/4">IMEI</TableHead>
            <TableHead className="text-black/80 text-lg font-medium md:flex w-32 lg:w-36">Status</TableHead>
            <TableHead className="text-black/80 text-lg w-20 font-medium">Ações</TableHead>
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
                index={(index + 1 * ((page - 1) * limit))}
                id={device.$id!}
                phone_number={device.phone_number}
                phone_model={device.phone_model}
                brand={device.brand}
                imei={device.imei}
                isStolen={device.is_stolen!}
                status={device.status!}
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

          {/* <TableRow>
            <TableCell colSpan={6} className="text-center">
              <Pagination className="flex items-center justify-center w-full">
                <PaginationContent className="py-1">
                  <PaginationItem>
                    <button
                      disabled={page === 1}
                      className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
                      onClick={handleGoToPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Anterior</span>
                    </button>
                  </PaginationItem>
                  {
                    [...Array(pages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <button
                          onClick={() => handleGoToPage(index + 1)}
                          className={cn("rounded-full px-3 py-1", index === page - 1 ? "bg-zinc-200 hover:bg-zinc-300" : "hover:bg-zinc-200")}
                        >
                          {index + 1}
                        </button>
                      </PaginationItem>
                    ))
                  }
                  <PaginationItem>
                    <button
                      disabled={page * limit >= totalDevices}
                      className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
                      onClick={handleGoToNextPage}>
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TableCell>
          </TableRow> */}
        </TableBody>

      </Table >
    </>

  )
}
