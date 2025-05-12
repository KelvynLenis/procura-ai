import { EditProfileForm } from '@/components/Forms/EditProfileForm'

export default async function Perfil() {
  return (
    <>
      <div className="w-full h-full flex flex-col justify-center py-10 pr-4 -ml-6 md:-ml-4 md:mr-1">
        <EditProfileForm />
      </div>
    </>
  )
}
