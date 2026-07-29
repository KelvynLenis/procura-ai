import { NextResponse } from "next/server";
import { emailService } from "@/services/email";
import { getUserById } from "@/functions/user/get-user-by-id";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imei, newOwnerName } = body;

    const devices = await getDeviceByImei(imei);

    const originalDevice = devices.filter(
      (device) => device.status !== "Solicitado",
    )[0];

    const requestedDevice = devices.filter(
      (device) => device.status === "Solicitado",
    )[0];

    const ownerId = originalDevice.auth_id;
    const owner = await getUserById(ownerId);

    const requesterId = requestedDevice.auth_id;
    const requester = await getUserById(requesterId);

    const { token, tokenHash } = createToken();

    await saveToken(tokenHash, ownerId, requesterId, imei);

    if (!originalDevice) {
      return NextResponse.json({ success: false, error: "device_not_found" });
    }

    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://procuraai-homolog.secties.pb.gov.br/v1";

    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://procuraai.secties.pb.gov.br";

    const content = `
      <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
        Olá, ${owner.name}!
      </h2>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        Informamos que a posse do seu dispositivo: <strong>${originalDevice.phone_model} / ${originalDevice.brand}</strong> foi solicitado por ${requester.name}.
        Você confirma essa solicitação?

        <br />

        <a href="${BASE_URL}/confirm-ownership-transfer?token=${token}">
          Sim
        </a>

        <br />

        <a href="${BASE_URL}/refuse-ownership-transfer?token=${token}">
          Não
        </a>
      </p>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        ATENÇÃO: Ao confirmar essa solicitação, o dispositivo passará a pertencer ao novo proprietário.
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
      users: [{ email: owner.email }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao solicitar transferência:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

function createToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

async function saveToken(
  tokenHash: string,
  ownerId: string,
  requesterId: string,
  deviceImei: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_TRANSFER_TOKENS}/documents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        documentId: uuidv4(),
        data: {
          token_hash: tokenHash,
          owner_id: ownerId,
          requester_id: requesterId,
          device_imei: deviceImei,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao salvar token: ${error}`);
  }
}
