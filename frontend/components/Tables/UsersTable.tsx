'use client';


import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { UserRow } from "./UserRow";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  $id: string;
  name?: string;
  cpf?: string;
  email?: string;
}

interface UsersTableProps {
  pageNumberParam?: number;
}

export function UsersTable({ pageNumberParam }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageNumberParam || 0);
  const [pages, setPages] = useState(0);

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

  async function buildParams(page?: number) {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: "limit",
        values: 5,
      }),

    });
    return params;
  }

  const fetchUsers = async (page?: number) => {
    console.log(page);
    setLoading(true);
    try {
      const params = page ? buildParams(page) : '';

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

      const totalPages = Math.ceil(result.total / 5);

      setPages(totalPages);
      setUsers(result.documents || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const user = users[0];

  return (
    <div className="bg-white shadow-lg rounded-lg self-center w-full">
      <div className="bg-zinc-200/60 flex w-full py-4">
        <div className="flex w-full gap-10 pl-4 lg:pl-0 lg:justify-around">
          <span className="w-[20%] lg:w-[40%] text-center">ID</span>
          <span className="w-[25%] text-center">Nome</span>
          <span className="w-[25%] text-center">Email</span>
          <span className="text-center w-[25%]">Ações</span>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="w-full flex gap-5 px-7 pt-7">
            <div className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="w-1/4">
              <Skeleton className="h-8 w-full" />
            </div>

          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <UserRow key={user.$id} user={user} />
          ))
        ) : (
          <div>
            <span className="text-center">
              Nenhum usuário encontrado.
            </span>
          </div>
        )}

        {/* <Pagination>
          <PaginationContent className="py-1">
            <PaginationItem>
              <button className="flex items-center gap-1 hover:bg-zinc-100 rounded-md p-2" onClick={handleGoToPreviousPage}>
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            </PaginationItem>
            {
              [...Array(pages)].map((_, index) => (
                <PaginationItem key={index}>
                  <button onClick={() => handleGoToPage(index)} className={cn("rounded-full px-3 py-1", index === page ? "bg-zinc-200 hover:bg-zinc-300" : "hover:bg-zinc-100")} >{index + 1}</button>
                </PaginationItem>
              ))
            }
            <PaginationItem>
              <button className="flex items-center gap-1 hover:bg-zinc-100 rounded-md p-2" onClick={handleGoToNextPage}>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination> */}

      </div>
    </div>
  );
}
