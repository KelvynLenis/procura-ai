import { AlertsTable } from '@/components/Tables/AlertsTable'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'

export default async function page() {
  const occurences = await joinDevicesEventsUsers()

  console.log(occurences)

  return (
    <div className="w-full h-full flex justify-center py-10 mr-5">
      <AlertsTable occurrences={occurences} />
    </div>
  )
}
