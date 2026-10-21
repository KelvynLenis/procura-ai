import { AlertsTable } from "@/components/Tables/AlertsTable";
import { joinDevicesEventsUsers } from "@/functions/occurences/get-occurrences";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // const occurences = await joinDevicesEventsUsers()
  const { id } = await searchParams;

  return (
    <div className="mr-5 flex h-full w-full justify-center py-10">
      <div className="mr-3 flex h-full w-full flex-col rounded-lg bg-zinc-100 text-procura-ai-zinc shadow-lg ring-1 ring-[#232323]/20">
        <AlertsTable deviceNotificationId={id} />
      </div>
    </div>
  );
}
