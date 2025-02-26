import { DeviceForm } from "@/components/Forms/DeviceForm";
export default async function AddDevice() {

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center pr-20 my-5">
        <DeviceForm />
      </div >
    </>
  )
}