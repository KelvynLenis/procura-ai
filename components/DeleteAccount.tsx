import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteContactByUserId } from "@/functions/contact/delete-contact-by-user-id";
import { deleteDevice } from "@/functions/device/delete-device";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import { listDevices } from "@/functions/device/list-devices";
import { updateDevice } from "@/functions/device/update-device";
import { updateDeviceStatus } from "@/functions/device/update-device-status";
import { deleteUser } from "@/functions/user/delete-user";
import { getUserDocumentId, getUserId } from "@/functions/user/get-user-id";
import { Device } from "@/types";
import { ca } from "date-fns/locale";
import { Sparkle, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccount() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      const [userDocumentId, userId] = await Promise.all([
        getUserDocumentId(),
        getUserId(),
      ]);

      const { documents: userDevices } = await listDevices({
        userId,
        limit: 100,
        page: 1,
      });

      console.log("userDevices", userDevices);

      for (const device of userDevices) {
        const devicesWithSameImei = await getDeviceByImei(device.imei);
        if (
          devicesWithSameImei.some((device) => device.status === "Solicitado")
        ) {
          const requestedDevice = devicesWithSameImei.find(
            (device) => device.status === "Solicitado",
          );

          await updateDevice(
            device.$id,
            {
              auth_id: requestedDevice?.auth_id,
              phone_number: requestedDevice?.phone_number,
              operator_id: requestedDevice?.operator_id,
            } as Device,
            requestedDevice?.auth_id!,
          );

          continue;
        }

        await updateDevice(
          device.$id,
          {
            auth_id: "",
          } as Device,
          "",
        );
      }

      const hasSucceededToDeleteContacts = await deleteContactByUserId(userId!);

      console.log("hasSucceededToDeleteContacts", hasSucceededToDeleteContacts);

      if (!hasSucceededToDeleteContacts) {
        throw new Error("Erro ao deletar contatos");
      }

      const response = await deleteUser(userId!, userDocumentId!);

      if (response) {
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Erro", error);
    }
  }

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger className="flex items-center gap-2 text-red-500 hover:opacity-80">
          <Trash2 size={20} />
          <span>Excluir conta</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col items-center">
              <TriangleAlert
                size={60}
                color="#fff"
                fill="#e11d48"
                className="self-center"
              />
              Tem certeza que quer excluir sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col text-primary">
              Esta ação é permanente e não pode ser desfeita. Ao excluir sua
              conta no Procura.Aí, você perderá o acesso a:
              <ul className="my-3 flex flex-col gap-2 px-2">
                <li className="flex items-center gap-2 text-base">
                  <Sparkle size={15} fill="#F566F3" color="#F566F3" /> Seu
                  perfil e dispositivos cadastrados.
                </li>
                <li className="flex items-center gap-2 text-base">
                  <Sparkle size={15} fill="#F566F3" color="#F566F3" />{" "}
                  Acompanhamento de ocorrências criadas.
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex w-full flex-row items-center justify-between gap-4">
            <AlertDialogCancel className="flex w-full flex-1 items-center justify-center rounded-full border-[0.5px] border-red-500 bg-white px-2 py-2 text-center text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex w-full flex-1 items-center justify-center self-end rounded-full border-[0.5px] border-secondary bg-secondary px-2 py-2 text-center text-white transition-all duration-300 hover:bg-white hover:text-secondary"
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
