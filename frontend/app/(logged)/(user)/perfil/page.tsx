import { EditProfileForm } from "@/components/Forms/EditProfileForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function Perfil() {

  return (
    <>
      <div className="w-full flex items-center justify-center">
        <EditProfileForm />
      </div>
    </>
  )
}