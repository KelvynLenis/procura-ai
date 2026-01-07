import { NextResponse } from "next/server";
import { exchangeCodeForToken, getUserInfo } from "@/lib/govbr/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // Verifica erros na resposta do Gov.br
  if (error || !code) {
    const errorType = error ? "govbr_auth_failed" : "govbr_missing_code";
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/login?error=${errorType}`, baseUrl));
  }

  try {
    // Obtém token e informações do usuário do Gov.br
    const tokenResponse = await exchangeCodeForToken(code);
    const userData = await getUserInfo(tokenResponse.access_token);

    // Redireciona para página de callback que processará no cliente
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const redirectUrl = new URL("/govbr-callback", baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    // Armazena dados do usuário em cookie temporário para o cliente processar
    response.cookies.set(
      "govbr_user_data",
      JSON.stringify({
        sub: userData.sub,
        email: userData.email || null,
        name: userData.name || null,
        preferred_username: userData.preferred_username || null,
      }),
      {
        httpOnly: false, // Cliente precisa acessar
        secure: true,
        sameSite: "lax",
        maxAge: 300, // 5 minutos apenas
        path: "/",
      },
    );

    response.cookies.set("govbr_auth_state", "", {
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Erro durante autenticação:", error);

    const errorMessage =
      error instanceof Error
        ? encodeURIComponent(error.message.substring(0, 100))
        : "unknown_error";

    // Usar a URL base correta para o redirecionamento
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", "govbr_system_error");
    loginUrl.searchParams.set("details", errorMessage);

    return NextResponse.redirect(loginUrl);
  }
}
