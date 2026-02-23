"use client";

import { toast } from "react-toastify";
import { LoadingToast } from "./LoadingToast";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AddDevice from "@/assets/icons/add-device.svg";
import AddDeviceFocused from "@/assets/icons/add-device-focused.svg";
import ContactsIcon from "@/assets/icons/contacts.svg";
import ContactsFocusedIcon from "@/assets/icons/contacts-focused.svg";
import { Smartphone, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function MobileNavBar() {
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname().slice(1);

  const router = useRouter();

  function showLoadingToast(url: string) {
    setIsLoading(true);
    // toast(<LoadingToast isReactToastifyComponent />, {
    //   autoClose: 1000,
    //   hideProgressBar: true,
    //   position: "top-center",
    //   closeOnClick: true,
    // });
    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/${url}`);
  }

  return (
    <>
      <div className="fixed bottom-0 z-[30] flex h-[86px] w-full items-center justify-center bg-white px-2 shadow-lg lg:hidden">
        <button
          type="button"
          className="flex w-1/4 flex-col items-center justify-between gap-2 text-xs"
          onClick={() => showLoadingToast("/meus-dispositivos")}
        >
          <Smartphone
            size={24}
            className={cn(pathname === "meus-dispositivos" && "text-secondary")}
          />
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                "w-20",
                pathname === "meus-dispositivos" && "text-secondary",
              )}
            >
              Meus dispositivos
            </span>
            {pathname === "meus-dispositivos" && (
              <span className="h-0.5 w-1/2 rounded-xl bg-secondary" />
            )}
          </div>
        </button>

        <button
          type="button"
          className="flex w-1/4 flex-col items-center justify-between gap-2 text-xs"
          onClick={() => showLoadingToast("/cadastrar-dispositivo")}
        >
          {pathname === "cadastrar-dispositivo" ? (
            <Image
              src={AddDeviceFocused}
              alt="Devices icon"
              className="h-6 w-6"
            />
          ) : (
            <Image src={AddDevice} alt="Devices icon" className="h-6 w-6" />
          )}
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                "w-16",
                pathname === "cadastrar-dispositivo" && "text-secondary",
              )}
            >
              Adicionar novo
            </span>
            {pathname === "cadastrar-dispositivo" && (
              <span className="h-0.5 w-1/2 rounded-xl bg-secondary" />
            )}
          </div>
        </button>

        <button
          type="button"
          className="flex w-1/4 flex-col items-center justify-between gap-2 text-xs"
          onClick={() => showLoadingToast("/contatos-de-confianca")}
        >
          {pathname === "contatos-de-confianca" ? (
            <Image
              src={ContactsFocusedIcon}
              alt="Devices icon"
              className="h-6 w-6"
            />
          ) : (
            <Image src={ContactsIcon} alt="Devices icon" className="h-6 w-6" />
          )}
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                "w-[70px]",
                pathname === "contatos-de-confianca" && "text-secondary",
              )}
            >
              Contatos de confiança
            </span>
            {pathname === "contatos-de-confianca" && (
              <span className="h-0.5 w-1/2 rounded-xl bg-secondary" />
            )}
          </div>
        </button>

        <button
          type="button"
          className="flex w-1/4 flex-col items-center justify-between gap-2 text-xs"
          onClick={() => showLoadingToast("/perfil")}
        >
          <User className={cn(pathname === "perfil" && "text-secondary")} />
          <div className="h-8">
            <span
              className={cn("w-16", pathname === "perfil" && "text-secondary")}
            >
              Perfil
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
