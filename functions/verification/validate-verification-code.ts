interface ValidateVerificationCodeResponse {
  success: boolean;
  message: string;
  userId?: string;
  sessionSecret?: string;
}

const HANDLED_STATUSES = new Set([401, 404, 410, 429]);

export async function validateVerificationCode(email: string, code: string) {
  const response = await fetch("/api/validate-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const payload = (await response.json()) as ValidateVerificationCodeResponse;

  if (!response.ok && !HANDLED_STATUSES.has(response.status)) {
    throw new Error(payload?.message || "Erro ao validar codigo");
  }

  return payload;
}
