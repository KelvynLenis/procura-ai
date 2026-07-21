import { NextResponse } from "next/server";
import { emailService } from "@/services/email";
import { getUserById } from "@/functions/user/get-user-by-id";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import { getUserId } from "@/functions/user/get-user-id";
import { updateDeviceStatus } from "@/functions/device/update-device-status";
import { deleteDevice } from "@/functions/device/delete-device";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      deviceId: string;
      imei: string;
    }>;
  },
) {
  try {
    const { deviceId, imei } = await params;
    const devices = await getDeviceByImei(imei);
    const deviceToUpdate = devices.filter(
      (device) => device.status === "Solicitado",
    );

    await updateDeviceStatus(deviceToUpdate[0].$id, {
      is_stolen: false,
      status: "Regular",
    });

    await deleteDevice(deviceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao enviar notificação" },
      { status: 500 },
    );
  }
}
