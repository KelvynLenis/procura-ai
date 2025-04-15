'use client'

import { useEffect, useState } from 'react'
import type { DeviceProps } from '@/types'
import { account } from '@/lib/appwrite'
import Button from './Button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DevicesList } from './DevicesList'
import { Pagination, PaginationContent, PaginationItem } from './ui/pagination'
import { DevicesTable } from './Tables/DevicesTable'
import { listDevices } from '@/functions/device/list-devices'

export function DevicesComponent() {
  const [devices, setDevices] = useState<DeviceProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [totalDevices, setTotalDevices] = useState(0)

  const limit = 5

  async function getUserId() {
    const { $id: userId } = await account.get()
    return userId
  }

  function handleGoToNextPage() {
    if (page < pages) {
      setPage(page + 1)
    }
  }

  function handleGoToPage(pageNumber: number) {
    setPage(pageNumber)
  }

  function handleGoToPreviousPage() {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  function showLoadingToast() {
    setIsLoading(true)
  }

  useEffect(() => {
    const getDevices = async () => {
      setIsLoading(true)
      try {
        const userId = await getUserId()
        const result = await listDevices({ userId, limit, page })

        console.log(result)

        const totalPages = Math.ceil(result.total / limit)
        setDevices(result.documents || [])
        setTotalDevices(result.total || 0)
        setPages(totalPages)
      } catch (err) {
        console.error('Erro ao buscar dispositivos:', err)
      } finally {
        setIsLoading(false)
      }
    }

    getDevices()
  }, [page, limit])

  return (
    <>
      <div className="hidden md:block">
        <DevicesTable
          devices={devices}
          setDevices={setDevices}
          page={page}
          limit={limit}
          totalDevices={totalDevices}
          pages={pages}
          isLoading={isLoading}
        />
        <Link href={'/cadastrar-dispositivo'} className="self-end">
          <Button onClick={showLoadingToast} variant="blue" className="my-3">
            Cadastrar dispositivo
          </Button>
        </Link>
      </div>

      <div className="md:hidden">
        <DevicesList
          devices={devices}
          setDevices={setDevices}
          page={page}
          limit={limit}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>

      <Pagination className="flex items-center justify-center w-full">
        <PaginationContent className="py-1">
          <PaginationItem>
            <button
              type="button"
              disabled={page === 1}
              className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
              onClick={handleGoToPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
          </PaginationItem>
          {[...Array(pages)].map((_, index) => (
            <PaginationItem key={index}>
              <button
                type="button"
                onClick={() => handleGoToPage(index + 1)}
                className={cn(
                  'rounded-full px-3 py-1',
                  index === page - 1
                    ? 'bg-zinc-200 hover:bg-zinc-300'
                    : 'hover:bg-zinc-200'
                )}
              >
                {index + 1}
              </button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <button
              type="button"
              disabled={page * limit >= totalDevices}
              className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent"
              onClick={handleGoToNextPage}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
