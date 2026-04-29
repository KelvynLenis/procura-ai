"use client";

import { useEffect, useState } from "react";
import type { DeviceProps } from "@/types";
import { account } from "@/lib/appwrite";
import Button from "../Button";
import { DevicesList } from "./DevicesList/DevicesList";
import { DevicesTable } from "./DevicesTable/DevicesTable";
import { listDevices } from "@/functions/device/list-devices";
import { useStatus } from "@/hooks/useStatus";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/store/alert.store";

import { ConfirmationDialog } from "../ConfirmationDialog";

export function DevicesWrapper({
  deviceNotificationId,
}: {
  deviceNotificationId?: string;
}) {
  const [devices, setDevices] = useState<DeviceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const { userStatus } = useStatus();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasCreatedANewAlert = useAlertStore(
    (state) => state.hasCreatedANewAlert,
  );
  const setHasCreatedANewAlert = useAlertStore(
    (state) => state.setHasCreatedANewAlert,
  );

  const limit = 100;

  async function getUserId() {
    const { $id: userId } = await account.get();
    return userId;
  }

  function handleChangeAlertStoreState() {
    setHasCreatedANewAlert(false);
  }

  const redirectToPolicePage = () => {
    setHasCreatedANewAlert(false);
    window.open(
      "https://delegaciaonline.pc.pb.gov.br/tipo-ocorrencia",
      "_blank",
      "noopener,noreferrer",
    );
  };

  function showLoadingToast() {
    router.push("/cadastrar-dispositivo");
    setIsLoading(true);
  }

  useEffect(() => {
    console.log(hasCreatedANewAlert);
    // if (hasCreatedANewDevice) {
    //   setIsDialogOpen(true);
    // }
  }, [hasCreatedANewAlert]);

  useEffect(() => {
    const getDevices = async () => {
      setIsLoading(true);
      try {
        const userId = await getUserId();
        const result = await listDevices({ userId, limit, page });

        const totalPages = Math.ceil(result.total / limit);
        setDevices(result.documents || []);
        setTotalDevices(result.total || 0);
        setPages(totalPages);
      } catch (err) {
        console.error("Erro ao buscar dispositivos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [page, limit]);

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
          deviceNotificationId={deviceNotificationId}
        />
        <Button
          onClick={showLoadingToast}
          variant={userStatus === "Ativo" ? "blue" : "disabled"}
          disabled={userStatus !== "Ativo"}
          className="my-3"
        >
          Cadastrar dispositivo
        </Button>
      </div>

      <div className="md:hidden">
        <DevicesList
          devices={devices}
          setDevices={setDevices}
          page={page}
          limit={limit}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          deviceNotificationId={deviceNotificationId}
        />

        <ConfirmationDialog
          title="Alerta cadastrado com sucesso"
          description="Deseja abrir um boletim de ocorrência na Delegacia online da Paraíba?"
          cancelText="Agora não"
          confirmText="Criar boletim"
          isOpen={hasCreatedANewAlert}
          onConfirm={() => redirectToPolicePage()}
          onCancel={handleChangeAlertStoreState}
        />
      </div>
    </>
  );
}
