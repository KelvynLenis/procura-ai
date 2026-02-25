"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { UserRow } from "./UserRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "../ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { LoadingToast } from "@/components/LoadingToast";
import { listUsers } from "@/functions/user/list-users";
import { exportUsers } from "@/functions/export/export-users";
import { exportAlerts } from "@/functions/export/export-alerts";
import type { User } from "@/types";

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    users: true,
    alerts: false,
  });
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportOptionChange = (option: "users" | "alerts") => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleExportClick = () => {
    setIsExportDialogOpen(true);
  };

  const handleConfirmExport = async () => {
    setIsExporting(true);
    try {
      if (exportOptions.users) {
        await exportUsers();
      }
      if (exportOptions.alerts) {
        await exportAlerts();
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const result = await listUsers(page, limit);
        const totalPages = Math.ceil(result.total / limit);

        setUsers(result.documents || []);
        setTotalUsers(result.total || 0);
        setPages(totalPages);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao buscar usuários. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  return (
    <>
      {/* {isExporting && <LoadingToast isReactToastifyComponent={false} />} */}
      <div className="flex w-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="blue"
            className="w-44"
            onClick={handleExportClick}
            disabled={users.length === 0 || loading}
          >
            Exportar planilha
          </Button>
        </div>

        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Selecione os arquivos para exportar</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.users}
                  onChange={() => handleExportOptionChange("users")}
                  className="h-4 w-4"
                />
                Emitir Usuarios.csv
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.alerts}
                  onChange={() => handleExportOptionChange("alerts")}
                  className="h-4 w-4"
                />
                Emitir Alertas.csv
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="white"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="blue"
                onClick={handleConfirmExport}
                disabled={!exportOptions.users && !exportOptions.alerts}
              >
                Exportar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Table className="w-full rounded-lg bg-white shadow-lg">
          <TableHeader className="bg-[#E6F1FD]">
            <TableRow>
              <TableHead className="text-center text-lg font-medium text-black/80">
                ID
              </TableHead>
              <TableHead className="text-lg font-medium text-black/80">
                Nome
              </TableHead>
              <TableHead className="text-lg font-medium text-black/80">
                Email
              </TableHead>
              <TableHead className="text-lg font-medium text-black/80">
                Perfil
              </TableHead>
              <TableHead className="text-lg font-medium text-black/80">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="w-full gap-5 px-7 pt-7">
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
                <UserRow
                  key={user.$id}
                  user={user}
                  index={index + 1 * ((page - 1) * limit)}
                  setUsers={setUsers}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <Pagination className="flex w-full items-center justify-center">
                  <PaginationContent className="py-1">
                    <PaginationItem>
                      <button
                        type="button"
                        disabled={page === 1}
                        className="flex items-center gap-1 rounded-md p-2 hover:bg-zinc-200 disabled:text-zinc-500 disabled:hover:bg-transparent"
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
                            "rounded-full px-3 py-1",
                            index === page - 1
                              ? "bg-zinc-200 hover:bg-zinc-300"
                              : "hover:bg-zinc-200",
                          )}
                        >
                          {index + 1}
                        </button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <button
                        type="button"
                        disabled={page * limit >= totalUsers}
                        className="flex items-center gap-1 rounded-md p-2 hover:bg-zinc-200 disabled:text-zinc-500 disabled:hover:bg-transparent"
                        onClick={handleGoToNextPage}
                      >
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
    </>
  );
}
