import { DeviceForm } from '@/components/Forms/DeviceForm'
import ProtectedRoute from '@/components/ProtectedRoute'
export default async function AddDevice() {
  return (
    <>
      <ProtectedRoute>
        <div className="w-full flex flex-col items-center justify-center pr-20 my-5">
          <DeviceForm />
        </div>
      </ProtectedRoute>
    </>
  )
}
