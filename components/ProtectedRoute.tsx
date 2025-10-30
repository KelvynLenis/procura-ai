"use client";

import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { checkUserStatus } from "@/functions/user/check-user-status";
import { deleteUserSession } from "@/functions/user/delete-user";

interface ProtectedRouteProps {
  admin?: boolean;
  children: ReactNode;
}

export default function ProtectedRoute({
  admin,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const user = await account.get(); // Verifica se o usuário está autenticado

        // Verifica o status e permissões do usuário
        const userStatus = await checkUserStatus(user.$id);

        // Verifica se é rota de admin e usuário não é admin
        if (admin && !userStatus.isAdmin) {
          toast.error("Acesso negado: Permissão de administrador necessária");
          router.push("/login");
          return;
        }

        if (!admin && userStatus.isAdmin) {
          toast.error("Acesso negado: Permissão de usuário necessária");
          router.push("/dashboard");
          return;
        }

        // Verifica se usuário está inativo
        if (userStatus.status === "Inativo") {
          toast.error("Usuário inativo");
          await deleteUserSession(user.$id);
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro na autenticação:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, [router, admin]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <ClipLoader color="#0F2498" size={75} />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
