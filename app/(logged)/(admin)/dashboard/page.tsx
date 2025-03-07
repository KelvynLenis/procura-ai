import { Dashboard } from "@/components/Charts/Dashboard";

export default async function DashboardPage() {

  return (
    <div className="flex flex-col w-full h-fit gap-10 mt-5 mr-2 mb-10 pb-10 px-2 md:pl-5 xl:pl-0 md:overflow-y-visible">

      <Dashboard />
    </div>
  )
}