'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

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

  return (
    <Table>
      <TableCaption>Lista de usuários cadastrados no sistema.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Carregando...
            </TableCell>
          </TableRow>
        ) : users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.$id}>
              <TableCell className="// Pode ser opcional dependendo da APIfont-medium">{user.$id}</TableCell>
              <TableCell>{user.name || "N/A"}</TableCell>
              <TableCell>{user.email || "N/A"}</TableCell>
              <TableCell className="text-center">
                <button className="w-20 bg-white rounded-xl hover:bg-primary hover:text-white shadow">
                  Testar
                </button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
