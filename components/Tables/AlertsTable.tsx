'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { DeviceProps, OccurrencesProps } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertRow } from './AlertRow'

interface DevicesTableProps {
  occurrences: OccurrencesProps[]
  totalDevices?: number
  page?: number
  pages?: number
  limit?: number
  isLoading?: boolean
}

export function AlertsTable({
  occurrences,
  totalDevices,
  page,
  pages,
  limit,
  isLoading,
}: DevicesTableProps) {
  const data = {
    phone_model: 'Redmi note 10',
    brand: 'Xiaomi',
    owner: 'Joaquim',
    imei: '123456789012345',
    status: 'Roubado',
  }

  return (
    <>
      <Table className="bg-white shadow-lg rounded-xl self-center">
        <TableHeader className="bg-zinc-200/60 rounded-xl">
          <TableRow>
            <TableHead className="text-black/80 text-lg font-medium pl-5">
              ID
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium">
              Dispositivo
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium">
              Propietário
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium">
              IMEI
            </TableHead>
            <TableHead className="text-black/80 text-lg font-medium pr-28">
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

              <TableCell className=" flex flex-col items-center gap-0.5">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </TableCell>
            </TableRow>
          ) : occurrences?.length! > 0 ? (
            occurrences?.map((occurence, index) => (
              <AlertRow key={index} index={index} occurrence={occurence} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum alerta cadastrado.
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
      </Table>
    </>
  )
}
