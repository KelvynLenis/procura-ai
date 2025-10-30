import { DevicesWrapper } from "@/components/Devices/DevicesWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

interface MeusDispositivosProps {
  searchParams: { id?: string };
}

export default async function MyDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <ProtectedRoute>
      <div className="w-full h-full flex flex-col justify-center py-3 lg:py-10 lg:pr-4 md:-ml-4 md:mr-1">
        <DevicesWrapper deviceNotificationId={id} />
      </div>
    </ProtectedRoute>
  );
}
