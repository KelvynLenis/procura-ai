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
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertRow } from './AlertRow'
import { Input } from '@/components/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Search, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Label } from '../ui/label'
import { Combobox } from '../Combobox'
import { DatePickerWithRange } from '../Datepicker'

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
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false)
  const [brandFilter, setBrandFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isBrandsPopoverOpen, setIsBrandsPopoverOpen] = useState(false)

  const brandsOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Samsung', value: 'samsung' },
    { label: 'Xiaomi', value: 'xiaomi' },
    { label: 'Oppo', value: 'oppo' },
    { label: 'Vivo', value: 'vivo' },
    { label: 'Motorola', value: 'motorola' },
    { label: 'Realme', value: 'realme' },
    { label: 'Asus', value: 'asus' },
    { label: 'Huawei', value: 'huawei' },
    { label: 'Sony', value: 'sony' },
  ]

  const statusOptions = [
    { label: 'Regular', value: 'Regular' },
    { label: 'Recuperado', value: 'Recuperado' },
    { label: 'Roubado', value: 'Roubado' },
    { label: 'Furtado', value: 'Furtado' },
    { label: 'Perdido', value: 'Perdido' },
  ]

  return (
    <>
      <div className="flex w-full justify-between py-2 px-4">
        <div className="relative">
          <Search className="absolute top-5 -translate-y-1/2 left-2 text-[#232323]/90" />
          <Input
            placeholder="Pesquise por IMEI ou proprietário"
            className="w-96 pl-10 ring-[#232323]/20 shadow-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className={cn(
              'ring-1 ring-[#232323]/30 text-[#232323] flex items-center justify-center gap-3 h-fit px-4 py-2 rounded-lg',
              isFilterOptionsOpen
                ? 'bg-zinc-200 hover:bg-white'
                : 'bg-white hover:bg-zinc-200'
            )}
            onClick={() => setIsFilterOptionsOpen(!isFilterOptionsOpen)}
          >
            <Settings2 size={18} />
            Filtar
          </button>

          <button
            type="button"
            className="ring-1 ring-[#232323]/30 bg-white hover:bg-zinc-200 text-[#232323] flex items-center justify-center gap-3 h-fit px-4 py-2 rounded-lg"
          >
            <Download size={18} />
            Exportar .CSV
          </button>

          <div className="flex items-center gap-2 ">
            <Checkbox className="shadow-none rounded-[4px] border-[#232323]/90" />
            Incluir dispositivos recuperados
          </div>
        </div>
      </div>

      {isFilterOptionsOpen && (
        <div className="flex flex-col gap-4 px-4 py-3">
          <div className="flex w-ful items-center justify-between">
            <span>Filtre por</span>

            <button
              type="button"
              className="ring-1 ring-[#232323]/30 bg-blue-600/20 hover:bg-zinc-200 text-[#232323] flex items-center justify-center gap-3 h-fit px-4 py-2 rounded-lg"
              onClick={() => setIsFilterOptionsOpen(!isFilterOptionsOpen)}
            >
              <Settings2 size={18} />
              Filtros
            </button>
          </div>

          <div className="flex justify-around gap-10">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Combobox
                options={statusOptions}
                value={statusFilter}
                onSelect={setStatusFilter}
                placeholder="Status"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Marca do dispositivo</Label>
              <Combobox
                options={brandsOptions}
                value={brandFilter}
                onSelect={setBrandFilter}
                placeholder="Marca"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Localização</Label>
              <Combobox
                options={brandsOptions}
                value={brandFilter}
                onSelect={setBrandFilter}
                placeholder="Localização"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <DatePickerWithRange />
            </div>
          </div>
        </div>
      )}
      <Table className="bg-white shadow-lg rounded-xl self-center">
        <TableHeader className="bg-zinc-200/60 rounded-xl">
          <TableRow className="ring-1 ring-zinc-200/60 border-y border-[#232323]/20">
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
