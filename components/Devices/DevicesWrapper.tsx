"use client";

import { useEffect, useState } from "react";
import type { DeviceProps } from "@/types";
import { account } from "@/lib/appwrite";
import Button from "../Button";
import Link from "next/link";
import { DevicesList } from "./DevicesList/DevicesList";
import { DevicesTable } from "./DevicesTable/DevicesTable";
import { listDevices } from "@/functions/device/list-devices";

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

  const limit = 100;

  async function getUserId() {
    const { $id: userId } = await account.get();
    return userId;
  }

  function showLoadingToast() {
    setIsLoading(true);
  }

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
        <Link href={"/cadastrar-dispositivo"} className="self-end">
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
          deviceNotificationId={deviceNotificationId}
        />
      </div>
    </>
  );
}
