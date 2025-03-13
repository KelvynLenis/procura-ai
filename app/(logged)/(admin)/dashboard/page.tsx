import { Dashboard } from '@/components/Charts/Dashboard'

export default async function DashboardPage() {
  return (
    <div className="flex flex-col w-full h-fit gap-10 mt-5 mr-2 px-2 md:overflow-y-visible">
      <Dashboard />
    </div>
  )
}
