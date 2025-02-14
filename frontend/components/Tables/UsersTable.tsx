'use client';


import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { UserRow } from "./UserRow";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button";
import { cn } from "@/lib/utils";

interface User {
  $id?: string;
  name?: string;
  cpf?: string;
  email?: string;
  type: string;
}


export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1);

  const [totalUsers, setTotalUsers] = useState(0)
  const limit = 10;

  async function buildParams() {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: "limit",
        values: [limit],
      }),
      "queries[1]": JSON.stringify({
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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = await buildParams();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
            },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Error: ${error}`);
        }

        const result = await response.json();

        console.log(result);

        const totalPages = Math.ceil(result.total / limit);

        setUsers(result.documents || []);
        setTotalUsers(result.total || 0);
        setPages(totalPages);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);


  return (
    <Table className="bg-white shadow-lg rounded-lg self-center">
      <TableHeader className="bg-zinc-200/60">
        <TableRow>
          <TableHead className="text-black/80 text-lg font-medium text-center">ID</TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">Nome</TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">Email</TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">Papel</TableHead>
          <TableHead className="text-black/80 text-lg font-medium ">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="w-full  gap-5 px-7 pt-7">
            <TableCell className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </TableCell>

            <TableCell className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </TableCell>

          </TableRow>
        ) : users.length > 0 ? (
          users.map((user, index) => (
            <UserRow key={user.$id} user={user} index={(index + 1 * ((page - 1) * limit))} />
          ))
        ) : (
          <TableRow>
            <TableCell className="text-center">
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        )}

        <TableRow>
          <TableCell colSpan={6} className="text-center">
            <Pagination className="flex items-center justify-center w-full">
              <PaginationContent className="py-1">
                <PaginationItem>
                  <button disabled={page === 1} className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent" onClick={handleGoToPreviousPage}>
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
                  <button disabled={page * limit >= totalUsers} className="flex items-center gap-1 hover:bg-zinc-200 rounded-md p-2 disabled:text-zinc-500 disabled:hover:bg-transparent" onClick={handleGoToNextPage}>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TableCell>
        </TableRow>

      </TableBody>
      {/* <div className="flex justify-between items-center mt-4">
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
          disabled={page * limit >= totalUsers}
          onClick={() => setPage(page + 1)}
        >
          Próximo
        </Button>
      </div> */}
    </Table>
  );
}
