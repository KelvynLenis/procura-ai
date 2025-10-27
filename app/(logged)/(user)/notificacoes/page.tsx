import { NotificationsList } from "@/components/NotificationsList";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function MyDevicesPage() {
  return (
    <ProtectedRoute>
      <div className="w-full h-Full flex flex-col justify-center py-3 lg:pr-4 md:-ml-4 md:mr-1">
        <NotificationsList />
      </div>
    </ProtectedRoute>
  );
}
