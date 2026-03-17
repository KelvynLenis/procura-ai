import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  deleteCode,
  getCodeByEmail,
  incrementAttempts,
  saveCode,
} from "./verification-store";
import { emailService } from "@/services/email";

const MAX_ATTEMPTS = 5;
const CODE_TTL_MS = 5 * 60 * 1000;

function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function handleSendCode(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const userId = body?.userId as string | undefined;
    const userName = body?.userName as string | undefined;

    if (!email || !userId) {
      return NextResponse.json(
        { success: false, message: "email e userId sao obrigatorios" },
        { status: 400 },
      );
    }

    const code = generateCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    await saveCode({
      email,
      hashedCode,
      expiresAt,
      userId,
      userName,
    });

    await emailService.sendVerificationCodeEmail({
      userEmail: email,
      userName,
      code,
    });

    return NextResponse.json({
      success: true,
      message: "Codigo enviado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar codigo:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao enviar o codigo. Tente novamente." },
      { status: 500 },
    );
  }
}

export async function handleValidateCode(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const code = body?.code as string | undefined;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "email e code sao obrigatorios" },
        { status: 400 },
      );
    }

    const document = await getCodeByEmail(email);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Nenhum codigo ativo encontrado. Solicite um novo.",
        },
        { status: 404 },
      );
    }

    const expiresAt = new Date(document.expires_at).getTime();
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      await deleteCode(document.$id);
      return NextResponse.json(
        { success: false, message: "Codigo expirado. Solicite um novo." },
        { status: 410 },
      );
    }

    if (document.attempts >= MAX_ATTEMPTS) {
      await deleteCode(document.$id);
      return NextResponse.json(
        {
          success: false,
          message: "Muitas tentativas incorretas. Solicite um novo codigo.",
        },
        { status: 429 },
      );
    }

    const hashedInput = hashCode(code);

    const hashedCode = document.hashed_code;

    if (hashedInput !== hashedCode) {
      const nextAttempts = document.attempts + 1;
      await incrementAttempts(document.$id, nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        await deleteCode(document.$id);
        return NextResponse.json(
          {
            success: false,
            message: "Muitas tentativas incorretas. Solicite um novo codigo.",
          },
          { status: 429 },
        );
      }

      const remainingAttempts = MAX_ATTEMPTS - nextAttempts;

      return NextResponse.json(
        {
          success: false,
          message: `Codigo incorreto. ${remainingAttempts} tentativa(s) restante(s).`,
        },
        { status: 401 },
      );
    }

    await deleteCode(document.$id);

    const resolvedUserId = document.user_id;

    return NextResponse.json({
      success: true,
      userId: resolvedUserId,
      message: "Codigo validado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao validar codigo:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao validar o codigo. Tente novamente." },
      { status: 500 },
    );
  }
}
