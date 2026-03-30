export async function createSessionFromToken(userId: string, secret: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/sessions/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      credentials: "include",
      body: JSON.stringify({ userId, secret }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro ao criar sessao");
  }

  return response.json();
}