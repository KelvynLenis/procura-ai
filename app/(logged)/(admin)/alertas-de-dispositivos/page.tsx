import { AlertsTable } from '@/components/Tables/AlertsTable'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'

export default async function page() {
  // const occurences = await joinDevicesEventsUsers()

  return (
    <div className="w-full h-full flex justify-center py-10 mr-5">
      <div className="flex flex-col bg-zinc-100 rounded-lg w-full h-full ring-1 ring-[#232323]/20 shadow-lg text-procura-ai-zinc">
        <AlertsTable />
      </div>
    </div>
  )
}
