import { Board } from "@/components/board";
import { AddDeviceForm } from "@/components/Forms/AddDeviceForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { account } from "@/lib/appwrite";

export default async function AddDevice() {

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full bg-tertiary px-10 py-3">
          <h1 className="text-2xl">Cadastrar Dispositivo</h1>
        </div>
        <AddDeviceForm />
      </div >
    </>
  )
}