import { NextRequest, NextResponse } from "next/server";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import crypto from "crypto";
import { Transfer } from "@/types";
import { updateDevice } from "@/functions/device/update-device";
import { deleteDevice } from "@/functions/device/delete-device";

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const transfer = await verifyToken(token!);

    const devices = await getDeviceByImei(transfer?.device_imei!);

    const originalDevice = devices.filter(
      (device) => device.status !== "Solicitado",
    );
    const deviceRequested = devices.filter(
      (device) => device.status === "Solicitado",
    );

    console.log("device to update: ", originalDevice[0]);
    console.log("device to delete: ", deviceRequested[0]);
    console.log("transfer: ", transfer);

    await updateDevice(
      originalDevice[0].$id,
      {
        phone_number: deviceRequested[0].phone_number,
        operator_id: deviceRequested[0].operator_id,
      },
      deviceRequested[0].auth_id,
    );

    await deleteDevice(deviceRequested[0].$id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao confirmar transferência:", error);
    return NextResponse.json({
      success: false,
      error: error,
      status: 500,
    });
  }
}

async function verifyToken(token: string): Promise<Transfer> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "token_hash",
      values: [tokenHash],
    }),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_TRANSFER_TOKENS}/documents?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao validar token: ${error}`);
  }

  const { documents } = await response.json();
  const transfer = documents[0];

  console.log("transfer: ", transfer);

  if (!transfer || transfer.token_hash !== tokenHash) {
    throw new Error("Token inválido");
  }

  if (transfer.used) {
    throw new Error("Token já utilizado");
  }

  await updateTokenReadStatus(transfer.$id);

  return transfer;
}

async function updateTokenReadStatus(documentId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_TRANSFER_TOKENS}/documents/${documentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        data: {
          used: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao atualizar status do token: ${error}`);
  }
}
