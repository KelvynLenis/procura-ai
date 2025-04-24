import { ContactsComponent } from '@/components/ContactsWrapper'
import ProtectedRoute from '@/components/ProtectedRoute'

export default async function MyDevicesPage() {
  return (
    <ProtectedRoute>
      <div className="w-full h-full flex flex-col justify-center py-10 lg:pr-4 -ml-6 md:-ml-4 md:mr-1">
        <ContactsComponent />
      </div>
    </ProtectedRoute>
  )
}
