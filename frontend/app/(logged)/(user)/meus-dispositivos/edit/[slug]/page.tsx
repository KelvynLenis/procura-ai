import { Board } from "@/components/board";
import { DeviceForm } from "@/components/Forms/DeviceForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { account } from "@/lib/appwrite";

export default async function EditDevice() {

  const phone_model = "en";
  const phone_number = "123456789";
  const brand = "en";
  const imei = "123456789012345";
  const latitude = 0.0;
  const longitude = 0.0;

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <DeviceForm device={{ phone_model, phone_number, brand, imei, latitude, longitude }} />
      </div >
    </>
  )
}