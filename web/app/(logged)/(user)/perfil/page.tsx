import { EditProfileForm } from '@/components/Forms/EditProfileForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default async function Perfil() {
  return (
    <>
      <ProtectedRoute>
        <div className="w-full h-full flex flex-col justify-center py-4 -ml-8 md:-ml-4 md:mr-1">
          <EditProfileForm />
        </div>
      </ProtectedRoute>
    </>
  )
}
