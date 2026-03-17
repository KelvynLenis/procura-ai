interface SendVerificationCodeResponse {
  success: boolean;
  message: string;
}

export async function sendVerificationCode(
  email: string,
  userId: string,
  userName?: string,
) {
  const response = await fetch("/api/send-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, userId, userName }),
  });

  const payload = (await response.json()) as SendVerificationCodeResponse;

  if (!response.ok) {
    throw new Error(payload?.message || "Erro ao enviar codigo");
  }

  return payload;
}
