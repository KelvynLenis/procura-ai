import { NextResponse } from "next/server";
import { emailService } from "@/services/email";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userName,
      userEmail,
      kind,
      deviceModel,
      deviceBrand,
      timeEvent,
      location,
      emergencyContacts,
    } = body ?? {};

    if (!isValidEmail(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_email",
          message: "userEmail é obrigatório e deve ser um e-mail válido",
        },
        { status: 400 },
      );
    }

    if (kind !== "roubo" && kind !== "furto") {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_kind",
          message: 'kind deve ser "roubo" ou "furto"',
        },
        { status: 400 },
      );
    }

    const contacts = Array.isArray(emergencyContacts)
      ? emergencyContacts.filter(
          (contact) =>
            contact &&
            typeof contact.email === "string" &&
            isValidEmail(contact.email),
        )
      : [];

    await emailService.sendIncidentAlertEmail({
      userName,
      userEmail,
      kind,
      deviceModel,
      deviceBrand,
      timeEvent,
      location,
      emergencyContacts: contacts,
    });

    return NextResponse.json({
      success: true,
      message: "Alerta de incidente enviado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar alerta de incidente:", error);
    return NextResponse.json(
      {
        success: false,
        error: "send_failed",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao enviar alerta de incidente",
      },
      { status: 500 },
    );
  }
}
