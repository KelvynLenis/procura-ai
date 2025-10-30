import { NextResponse } from "next/server";
import { emailService } from "@/services/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userName,
      userEmail,
      deviceModel,
      deviceBrand,
      location,
      description,
      emergencyContacts,
    } = body;

    await emailService.sendDeviceRecoveryEmail({
      userName,
      userEmail,
      deviceModel,
      deviceBrand,
      location,
      description,
      emergencyContacts,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao enviar notificação" },
      { status: 500 },
    );
  }
}
