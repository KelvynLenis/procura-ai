import { DevicesComponent } from "@/components/DevicesComponent";

export default async function MyDevicesPage() {

  return (
    <div className="w-full h-full flex flex-col justify-center py-10 pr-4 -ml-6 md:-ml-4 md:mr-1">
      <DevicesComponent />
    </div>
  )
}