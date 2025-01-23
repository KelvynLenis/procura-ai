'use client';


import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { UserRow } from "./UserRow";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

interface User {
  $id: string;
  name?: string;
  cpf?: string;
  email?: string;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);;
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents`,
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
      setUsers(result.documents || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const user = users[0];

  return (
    <div className="bg-white shadow-lg rounded-lg self-center w-full">
      <div className="bg-zinc-200/60 flex w-full py-4">
        <div className="flex w-full justify-around">
          <span className="w-[40%] text-center">ID</span>
          <span className="w-[25%] text-center">Nome</span>
          <span className="w-[25%] text-center">Email</span>
          <span className="text-center w-[25%]">Ações</span>
        </div>
      </div>
      <div>
        {loading ? (
          <div>
            <div>
              <Skeleton className="h-8 w-full" />
            </div>

            <div>
              <Skeleton className="h-8 w-full" />
            </div>

            <div>
              <Skeleton className="h-8 w-full" />
            </div>

            <div>
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

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            {/* <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem> */}
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>


      </div>
    </div>
  );
}
