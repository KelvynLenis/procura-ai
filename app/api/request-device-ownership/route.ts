import { NextResponse } from "next/server";
import { emailService } from "@/services/email";
import { getUserById } from "@/functions/user/get-user-by-id";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imei, newOwnerName } = body;

    const devices = await getDeviceByImei(imei);
    const device = devices.filter(
      (device) => device.status !== "Solicitado",
    )[0];
    const userId = device.auth_id;
    const user = await getUserById(userId);

    if (!device) {
      return NextResponse.json({ success: false, error: "device_not_found" });
    }

    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://procuraai-homolog.secties.pb.gov.br/v1";

    const content = `
      <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
        Olá, ${user.name}!
      </h2>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        Informamos que a posse do seu dispositivo: <strong>${device.phone_model} / ${device.brand}</strong> foi solicitado por ${newOwnerName}.
        Você confirma essa solicitação?

        <a href="https://procura-ai.vercel.app/api/confirm-ownership-transfer/${device.$id}/${imei}">
          Sim
        </a>

        <a href="https://procura-ai.vercel.app/">
          Sim
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
      users: [{ email: user.email }],
    });

    console.log("Notificação enviada com sucesso!");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao enviar notificação" },
      { status: 500 },
    );
  }
}
