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

    console.log("originalDevice: ", originalDevice);
    console.log("requestedDevice: ", requestedDevice);
    console.log("devices: ", devices);

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
      <div style="font-family: Arial, sans-serif; width: 100%; margin: 0; padding: 0;">
        <div style="background-color: #0B7AF5; width: 940px; height: 46px; border-radius: 10px; opacity: 1; margin: 40px auto 20px auto; display: flex; align-items: center; justify-content: center; transform: rotate(0deg); text-align: center;">
          <h1 style="color: #ffffff; margin: 0 auto; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 16px; line-height: 46px; letter-spacing: 0%; text-align: center; width: 100%;">Reivindicação de posse</h1>
        </div>

        <div style="color: #232323; width: 940px; margin: 0 auto;">
          <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
            Olá, ${owner.name}!
          </h2>

          <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
            O dispositivo ${originalDevice.phone_model} (IMEI ${originalDevice.imei.slice(0, 4)}**********) ainda está cadastrado na sua conta. Mas, outro usuário informou que é o atual proprietário deste dispositivo e solicitou o vínculo deste aparelho à conta dele. 
            <br />
            <br />
            
            <strong>Você confirma que não é mais o proprietário deste aparelho?</strong>
          </p>
          
          <br />

          <div style="text-align: center;">
            <a
              href="${BASE_URL}/confirm-ownership-transfer?token=${token}"
              style="
                display: inline-block;
                width: 371px;
                line-height: 45px;
                background-color: #212A38;
                color: #FFFFFF;
                text-decoration: none;
                border-radius: 40px;
                text-align: center;
              "
            >
              Não sou mais proprietário deste dispositivo
            </a>

            <br />

            <a
              href="${BASE_URL}/refuse-ownership-transfer?token=${token}"
              style="
                display: inline-block;
                width: 371px;
                line-height: 45px;
                background-color: #FFFFFF;
                color: #212A38;
                text-decoration: none;
                border-radius: 40px;
                border: 1px solid #212A38;
                text-align: center;
                margin-top: 16px;
              "
            >
              Este dispositivo ainda é meu
            </a>
          </div>
          

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
      users: [{ email: "kmartins.dev@gmail.com" }],
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
