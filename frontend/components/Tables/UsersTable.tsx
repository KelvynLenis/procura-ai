'use client';


import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { UserRow } from "./UserRow";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';

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

  const handleExportCSV = async () => {
    try {
      const allUsers: User[] = [];
      let offset = 0;
      const limit = 25;
      let total = Infinity;

      while (offset < total) {
        const params = new URLSearchParams({
          "queries[0]": JSON.stringify({
            method: "limit",
            values: [limit],
          }),
          "queries[1]": JSON.stringify({
            method: "offset",
            values: [offset],
          }),
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Falha ao buscar usuários: ${await response.text()}`);
        }

        const { documents, total: fetchedTotal } = await response.json();
        allUsers.push(...documents);
        total = fetchedTotal;
        offset += limit;
      }

      const headers = ['ID', 'Nome', 'Email', 'Perfil'];
      const csvData = allUsers.map(user => [
        user.$id || '',
        user.name || '',
        user.email || '',
        user.type || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', 'usuarios.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV. Tente novamente.');
    }
  };

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

        ;

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
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="blue"
          className="w-44"
          onClick={handleExportCSV}
          disabled={users.length === 0 || loading}
        >
          Exportar CSV
        </Button>
      </div>
      <Table className="bg-white shadow-lg rounded-lg w-full">
        <TableHeader className="bg-zinc-200/60">
          <TableRow>
            <TableHead className="text-black/80 text-lg font-medium text-center">ID</TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">Nome</TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">Email</TableHead>
            <TableHead className="text-black/80 text-lg font-medium ">Perfil</TableHead>
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
                      <span>Anterior</span>
                    </button>
                  </PaginationItem>
                  {
                    [...Array(pages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <button onClick={() => handleGoToPage(index + 1)} className={cn("rounded-full px-3 py-1", index === page - 1 ? "bg-zinc-200 hover:bg-zinc-300" : "hover:bg-zinc-200")} >{index + 1}</button>
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
      </Table>
    </div>
  );
}
