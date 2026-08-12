import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/services/email";
import { getUserById } from "@/functions/user/get-user-by-id";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import crypto from "crypto";
import { Transfer } from "@/types";
import { deleteDevice } from "@/functions/device/delete-device";

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const transfer = await verifyToken(token!);

    const devices = await getDeviceByImei(transfer.device_imei!);

    const originalDevice = devices.filter(
      (device) => device.status !== "Solicitado",
    );

    const deviceRequested = devices.filter(
      (device) => device.status === "Solicitado",
    );
    const requestUserId = deviceRequested[0].auth_id;
    const requestUser = await getUserById(requestUserId);

    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://procuraai-homolog.secties.pb.gov.br/v1";

    const content = `
      <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
        Olá, ${requestUser.name}!
      </h2>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        Informamos que a solicitação de posse do dispositivo: <strong>${deviceRequested[0].phone_model} / ${deviceRequested[0].brand}</strong> foi negada. Ele será removido da sua lista de dispositivos.
      </p>

      <div style="margin-top: 24px;">
        <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323; margin: 0 0 12px 0;">
          Para mais informações acesse:
          <a href="https://procura-ai.vercel.app/" style="color: #0B7AF5; text-decoration: none;"> https://procura-ai.vercel.app/</a>
          <br />
          Ou baixe nosso aplicativo, disponível nas lojas Google Play e Apple Store.
        </p>
        <img src="${API_BASE}/storage/buckets/6a2334a100098010118e/files/6a2335f0003c2cac6d87/view?project=6a136b34000bc009056d&mode=admin" alt="Lojas Disponíveis" style="width: 100%; max-width: 300px; height: auto; display: block; margin: 0; border-radius: 10px;" />
      </div>
    `.trim();

    await emailService.sendEmail({
      subject: "Solicitação de titularidade de dispositivo",
      content,
      users: [{ email: requestUser.email }],
    });

    await deleteDevice(deviceRequested[0].$id);

    return NextResponse.json({ success: true, device: originalDevice[0] });
  } catch (error) {
    console.error("Erro ao recusar transferência:", error);

    return NextResponse.json({
      success: false,
      error: error.message,
      status: 500,
    });
  }
}

async function getTransfer(token: string) {
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

  return { transfer, tokenHash };
}

async function verifyToken(token: string): Promise<Transfer> {
  const { transfer, tokenHash } = await getTransfer(token);

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
