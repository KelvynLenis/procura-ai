import { DevicesComponent } from '@/components/DevicesWrapper'
import ProtectedRoute from '@/components/ProtectedRoute'

export default async function MyDevicesPage() {
  return (
    <ProtectedRoute>
      <div className="w-full h-full flex flex-col justify-center py-10 pr-4 -ml-6 md:-ml-4 md:mr-1">
        <DevicesComponent />
      </div>
    </ProtectedRoute>
  )
}
