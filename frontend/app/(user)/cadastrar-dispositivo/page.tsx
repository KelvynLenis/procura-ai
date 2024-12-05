import { AddDeviceForm } from "@/components/AddDeviceForm";
import { Board } from "@/components/board";
import ProtectedRoute from "@/components/ProtectedRoute";
import { account } from "@/lib/appwrite";

export default async function AddDevice() {

  return (
    <>
      <ProtectedRoute>
        <div className="w-full flex items-center justify-center">
          <AddDeviceForm />
        </div>
      </ProtectedRoute>
    </>
  )
}