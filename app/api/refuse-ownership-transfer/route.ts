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
      <div style="font-family: Arial, sans-serif; width: 100%; margin: 0; padding: 0;">
        <div style="background-color: #D04228; width: 940px; height: 46px; border-radius: 10px; opacity: 1; margin: 40px auto 20px auto; display: flex; align-items: center; justify-content: center; transform: rotate(0deg); text-align: center;">
          <h1 style="color: #ffffff; margin: 0 auto; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 16px; line-height: 46px; letter-spacing: 0%; text-align: center; width: 100%;">Reivindicação de posse negada</h1>
        </div>

        <div style="color: #232323; width: 940px; margin: 0 auto;">
          <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
            Olá, ${requestUser.name}!
          </h2>

          <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
           Informamos que a reivindicação de posse do dispositivo: <strong style="font-weight: bold;">${deviceRequested[0].brand}</strong> foi <strong style="font-weight: bold;">negada</strong>. Ele será removido da sua lista de dispositivos cadastrada no Procura.Aí
          </p>
          <br />

          <h1 style="font-weight: bold; font-size: 14px;">Por que isso aconteceu?</h1>

          <p>Sua solicitação foi negada porque o proprietário atual negou a transferência  do dispositivo ou não conseguimos entrar em contato com ele.</p>
          
          <br />

          <p>Caso você ainda queira o cadastro deste dispositivo na sua conta do Procura.aí, você pode solicitar a Reivindicação de posse novamente através do nosso site ou aplicativo.</p>
          
          <br />

          <p>
            Para mais informações, acesse: https://procura-ai.vercel.app/  
            <br />
            ou baixe nosso aplicativo nas lojas oficiais
          </p>
          
          <br />
          

          <div style="margin-top: 24px;">
            <div style="margin-top: 30px padding-bottom: 20px; border-bottom: 1px solid #eee;">
              <p style="color: #232323;">Atenciosamente,</p>
              <p style="color: #232323; font-weight: bold; margin: 0;">Equipe ProcuraAí</p>
            </div>

            <span style="display: block; width: 940px; height: 1px; background-color: #eee; margin: 20px auto 40px auto;"></span>

            <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/689f324200195d812359/files/6a71d6840025fca3bd3a/view?project=689f30820026b5401f7d&impersonateuserid=&mode=admin" alt="Lojas Disponíveis" style="width: 100%; height: 100%;" />
          </div>
        </div>
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
