import { EditPerfilForm } from "@/components/EditPerfilForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function Perfil() {

  return (
    <>
      <div className="w-full flex items-center justify-center">
        <EditPerfilForm />
      </div>
    </>
  )
}