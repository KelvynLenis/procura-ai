import { ChartBoard } from "@/components/ChartBoard";
import { NotificationButton } from "@/components/NotificationButton";

export default async function Dashboard() {

  return (
    <div className="flex flex-col w-full h-fit gap-10 mt-5 mr-2 mb-10 pb-10 px-2 md:pl-5 xl:pl-0 md:overflow-y-visible">

      <ChartBoard />
      <NotificationButton />
    </div>
  )
}