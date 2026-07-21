import { NextResponse } from "next/server";
import { resolveBaseUrl, resolveGovBrRedirectUri } from "@/lib/base-url";
import { exchangeCodeForToken, getUserInfo } from "@/lib/govbr/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  
  if (!state || state.trim() === "") {
    return NextResponse.json(
      { success: false, error: "invalid_state", message: "Token de segurança inválido" },
      { status: 400 }
    );
  }
  
  const isMobile = state.startsWith("mobile_");
  
  if (isMobile) {
    try {
      const stateParts = state.split("_");
      if (stateParts.length < 2) {
        throw new Error("State mal formatado");
      }
      
      const timestamp = parseInt(stateParts[1], 10);
      const now = Date.now();
      const STATE_MAX_AGE = 5 * 60 * 1000;
      
      if (isNaN(timestamp) || (now - timestamp) > STATE_MAX_AGE) {
        const errorLink = new URL("procuraai://auth-callback");
        errorLink.searchParams.append("success", "false");
        errorLink.searchParams.append("error", "state_expired");
        errorLink.searchParams.append("message", "Token de segurança expirado. Tente novamente.");
        errorLink.searchParams.append("timestamp", new Date().toISOString());
        return NextResponse.redirect(errorLink.toString(), 302);
      }
    } catch (err) {
      
      const errorLink = new URL("procuraai://auth-callback");
      errorLink.searchParams.append("success", "false");
      errorLink.searchParams.append("error", "invalid_state_format");
      errorLink.searchParams.append("message", "Formato de token inválido");
      errorLink.searchParams.append("timestamp", new Date().toISOString());
      return NextResponse.redirect(errorLink.toString(), 302);
    }
  }

  // Verifica erros na resposta do Gov.br
  if (error || !code) {
    const errorType = error ? "govbr_auth_failed" : "govbr_missing_code";
    const errorMessage = error ? `Erro Gov.br: ${error}` : "Código de autorização não fornecido";
    
    if (isMobile) {
      const deepLinkUrl = new URL("procuraai://auth-callback");
      deepLinkUrl.searchParams.append("success", "false");
      deepLinkUrl.searchParams.append("error", errorType);
      deepLinkUrl.searchParams.append("message", errorMessage);
      deepLinkUrl.searchParams.append("timestamp", new Date().toISOString());
      return NextResponse.redirect(deepLinkUrl.toString(), 302);
    }
    
    const baseUrl = resolveBaseUrl(request);
    return NextResponse.redirect(new URL(`/login?error=${errorType}`, baseUrl));
  }

  try {
    const redirectUri = resolveGovBrRedirectUri(request);
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);
    const userData = await getUserInfo(tokenResponse.access_token);

    
    if (isMobile) {
      if (!userData.sub) {
        const errorLink = new URL("procuraai://auth-callback");
        errorLink.searchParams.append("success", "false");
        errorLink.searchParams.append("error", "missing_user_id");
        errorLink.searchParams.append("message", "Identificador de usuário não fornecido pelo Gov.br");
        errorLink.searchParams.append("timestamp", new Date().toISOString());
        return NextResponse.redirect(errorLink.toString(), 302);
      }
      
      const deepLinkUrl = new URL("procuraai://auth-callback");
      deepLinkUrl.searchParams.append("success", "true");
      deepLinkUrl.searchParams.append("sub", userData.sub);
      deepLinkUrl.searchParams.append("name", userData.name || "");
      deepLinkUrl.searchParams.append("email", userData.email || "");
      deepLinkUrl.searchParams.append("preferred_username", userData.preferred_username || "");
      deepLinkUrl.searchParams.append("cpf", userData.sub);
      deepLinkUrl.searchParams.append("timestamp", new Date().toISOString());
      
      return NextResponse.redirect(deepLinkUrl.toString(), 302);
    }
    const baseUrl = resolveBaseUrl(request);
    const redirectUrl = new URL("/govbr-callback", baseUrl);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(
      "govbr_user_data",
      JSON.stringify({
        sub: userData.sub,
        email: userData.email || null,
        name: userData.name || null,
        preferred_username: userData.preferred_username || null,
      }),
      {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 300,
        path: "/",
      },
    );

    response.cookies.set(
      "govbr_id_token",
      tokenResponse.id_token,
      {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      },
    );

    response.cookies.set("govbr_auth_state", "", {
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Erro durante autenticação:", error);
    
    if (isMobile) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const deepLinkUrl = new URL("procuraai://auth-callback");
      deepLinkUrl.searchParams.append("success", "false");
      deepLinkUrl.searchParams.append("error", "authentication_failed");
      deepLinkUrl.searchParams.append("message", errorMessage);
      deepLinkUrl.searchParams.append("timestamp", new Date().toISOString());
      
      return NextResponse.redirect(deepLinkUrl.toString(), 302);
    }

    const errorMessage =
      error instanceof Error
        ? encodeURIComponent(error.message.substring(0, 100))
        : "unknown_error";

    const baseUrl = resolveBaseUrl(request);
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", "govbr_system_error");
    loginUrl.searchParams.set("details", errorMessage);

    return NextResponse.redirect(loginUrl);
  }
}
