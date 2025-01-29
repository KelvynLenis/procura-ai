import { DevicesTable } from "@/components/Tables/DevicesTable";

export default async function MyDevicesPage() {

  return (
    <div className="w-full h-full flex justify-center py-10 mr-10">
      <DevicesTable />
    </div>
  )
}