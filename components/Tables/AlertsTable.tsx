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
import type { DeviceProps, OccurrencesProps, QueryFilter } from '@/types'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, validateIMEI } from '@/lib/utils'
import { AlertRow } from './AlertRow'
import { Input } from '@/components/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Search, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { Combobox } from '../Combobox'
import { DatePickerWithRange } from '../Datepicker'
import {
  joinDevicesEventsUsers,
  joinUsersDevicesEvents,
} from '@/functions/occurences/get-occurrences'

interface DevicesTableProps {
  totalDevices?: number
  page?: number
  pages?: number
  limit?: number
  isLoading?: boolean
}

export function AlertsTable({
  totalDevices,
  page,
  pages,
  limit,
}: DevicesTableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false)
  const [isBrandsPopoverOpen, setIsBrandsPopoverOpen] = useState(false)
  const [totalFilters, setTotalFilters] = useState(3)
  const [filterInput, setFilterInput] = useState('')
  const [countdownId, setcountdownId] = useState<NodeJS.Timeout>()
  const [brandFilter, setBrandFilter] = useState<QueryFilter>({
    method: 'equal',
    attribute: 'brand',
    values: [],
  } as QueryFilter)
  const [statusFilter, setStatusFilter] = useState<QueryFilter>({
    method: 'equal',
    attribute: 'status',
    values: ['Roubado', 'Furtado', 'Perdido'],
  } as QueryFilter)
  const [imeiFilter, setImeiFilter] = useState<QueryFilter>({
    method: 'equal',
    attribute: 'imei',
    values: [],
  } as QueryFilter)
  const [ownerFilter, setOwnerFilter] = useState({
    method: 'equal',
    attribute: 'name',
    values: [],
  } as QueryFilter)
  const [occurrences, setOccurrences] = useState<OccurrencesProps[]>(
    [] as OccurrencesProps[]
  )

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

  function handleSelectBrandsFilter(strings: string[]) {
    setBrandFilter({
      method: 'equal',
      attribute: 'brand',
      values: strings,
    })
  }

  function handleSelectStatusFilter(strings: string[]) {
    setStatusFilter({
      method: 'equal',
      attribute: 'status',
      values: strings,
    })
  }

  function handleInputFilter(value: string) {
    clearTimeout(countdownId)

    const timerId = setTimeout(() => {
      if (value.length === 0) {
        setImeiFilter({
          method: 'equal',
          attribute: 'imei',
          values: [],
        } as QueryFilter)

        setOwnerFilter({
          method: 'equal',
          attribute: 'name',
          values: [],
        } as QueryFilter)

        return
      }

      const isIMEI = /\d/.test(value)

      if (isIMEI) {
        setImeiFilter({
          method: 'contains',
          attribute: 'imei',
          values: [value],
        })

        return
      }

      setOwnerFilter({
        method: 'contains',
        attribute: 'name',
        values: [value],
      })
    }, 2000)

    setcountdownId(timerId)
  }

  function clearFilters() {
    setBrandFilter({
      method: 'equal',
      attribute: 'brand',
      values: [],
    })

    setStatusFilter({
      method: 'equal',
      attribute: 'status',
      values: [],
    })

    setImeiFilter({
      method: 'equal',
      attribute: 'imei',
      values: [],
    })
  }

  useEffect(() => {
    setIsLoading(true)

    async function getOccurrences() {
      const deviceActiveFilters = [
        ...(brandFilter.values.length > 0 ? [brandFilter] : []),
        ...(statusFilter.values.length > 0 ? [statusFilter] : []),
        ...(imeiFilter.values.length > 0 ? [imeiFilter] : []),
      ]

      const usersActiveFilters = [
        ...(ownerFilter.values.length > 0 ? [ownerFilter] : []),
      ]

      const filterOptions = {
        ...(deviceActiveFilters.length > 0
          ? { devicesFilters: deviceActiveFilters }
          : {}),
      }

      const occurrences = await joinDevicesEventsUsers(filterOptions)

      if (ownerFilter.values.length > 0) {
        const occurrencesFilteredByOwner = occurrences.filter(occurrence => {
          const user = occurrence.user

          return user.name
            .toLowerCase()
            .includes(ownerFilter.values[0].toLowerCase())
        })

        setOccurrences(occurrencesFilteredByOwner || [])
        setIsLoading(false)
        return
      }

      setOccurrences(occurrences)
      setIsLoading(false)
    }

    getOccurrences()

    setTotalFilters(brandFilter.values.length + statusFilter.values.length)
  }, [brandFilter, statusFilter, imeiFilter, ownerFilter])

  return (
    <>
      <div className="flex w-full justify-between py-2 px-4">
        <div className="relative">
          <Search className="absolute top-5 -translate-y-1/2 left-2 text-[#232323]/90" />
          <Input
            placeholder="Pesquise por IMEI ou proprietário"
            className="w-96 pl-10 ring-[#232323]/20 shadow-none"
            onChange={e => handleInputFilter(e.target.value)}
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
        </div>
      </div>

      {isFilterOptionsOpen && (
        <div className="flex flex-col gap-4 px-4 py-3">
          <div className="flex w-ful items-center justify-between">
            <span>Filtre por</span>

            <div className="flex gap-2">
              <button
                type="button"
                className="ring-1 ring-[#232323]/30 font-medium bg-blue-600/20 hover:bg-zinc-200 text-procura-ai-zinc flex items-center justify-center gap-3 h-fit px-4 py-2 rounded-lg"
                // onClick={() => setIsFilterOptionsOpen(!isFilterOptionsOpen)}
              >
                <Settings2 size={18} />
                Filtros{' - '}
                {totalFilters}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary font-medium"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="flex justify-around gap-10">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Combobox
                options={statusOptions}
                values={statusFilter.values}
                onSelect={handleSelectStatusFilter}
                placeholder="Status"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Marca do dispositivo</Label>
              <Combobox
                options={brandsOptions}
                values={brandFilter ? brandFilter.values : []}
                onSelect={handleSelectBrandsFilter}
                placeholder="Marca"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Localização</Label>
              {/* <Combobox
                options={brandsOptions}
                values={brandFilter.values}
                onSelect={setBrandFilter}
                placeholder="Localização"
                disabled
              /> */}
              <span className="w-40 h-12 cursor-default bg-zinc-200 ring-1 ring-[#232323]/30 text-center flex items-center justify-center text-zinc-400 italic rounded-md">
                Indisponível
              </span>
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
              <TableCell className="">
                <Skeleton className="h-8 w-full" />
              </TableCell>

              <TableCell className="">
                <Skeleton className="h-8 w-full" />
              </TableCell>

              <TableCell className="">
                <Skeleton className="h-8 w-full" />
              </TableCell>

              <TableCell className="w-56">
                <Skeleton className="h-8" />
              </TableCell>

              <TableCell className="w-10">
                <Skeleton className="h-8" />
              </TableCell>

              <TableCell className="flex items-center gap-2 mr-5">
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
