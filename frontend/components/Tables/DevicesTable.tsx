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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"

export function DevicesTable() {
  const [devices, setDevices] = useState<DeviceProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0)

  const limit = 5;


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
      "queries[1]": JSON.stringify({
        method: "limit",
        values: [limit],
      }),
      "queries[2]": JSON.stringify({
        method: "offset",
        values: [((page - 1) * limit)],
      }),
    });
    return params;
  }

  function handleGoToNextPage() {
    if (page < pages) {
      setPage(page + 1);
    }
  }

  function handleGoToPage(pageNumber: number) {
    setPage(pageNumber);
  }

  function handleGoToPreviousPage() {
    if (page > 0) {
      setPage(page - 1);
    }
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

        const totalPages = Math.ceil(result.total / limit);

        console.log(result.documents);
        setDevices(result.documents || []);
        setTotalDevices(result.total || 0);
        setPages(totalPages);
      } catch (err) {
        console.error(`Fetch error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [page]);

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

          <TableRow>
            <TableCell colSpan={6} className="text-center">
              <Pagination className="flex items-center justify-center w-full">
                <PaginationContent className="py-1">
                  <PaginationItem>
                    <button disabled={page === 1} className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2" onClick={handleGoToPreviousPage}>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                  </PaginationItem>
                  {
                    [...Array(pages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <button onClick={() => handleGoToPage(index)} className={cn("rounded-full px-3 py-1", index === page - 1 ? "bg-zinc-200 hover:bg-zinc-300" : "hover:bg-zinc-200")} >{index + 1}</button>
                      </PaginationItem>
                    ))
                  }
                  <PaginationItem>
                    <button className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2" onClick={handleGoToNextPage}>
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TableCell>
          </TableRow>
        </TableBody>

        {/*       
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="gray"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>

          <span>Página {page}</span>

          <Button
            variant="gray"
            disabled={page * limit >= totalDevices}
            onClick={() => setPage(page + 1)}
          >
            Próximo
          </Button>
        </div> */}
      </Table >
      <Link href={'/cadastrar-dispositivo'}>
        <Button onClick={showLoadingToast} variant="blue" className="self-end w-44 my-3">Cadastrar dispositivo</Button>
      </Link>
    </>

  )
}
