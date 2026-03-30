import { account } from "@/lib/appwrite";

function getAppHomeUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const safeBaseUrl = baseUrl.replace(/\/$/, "");
  return safeBaseUrl ? `${safeBaseUrl}/` : "/";
}

function clearClientSessionData() {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

export async function logoutToAppHome(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const homeUrl = getAppHomeUrl();

  try {
    const idToken = localStorage.getItem("govbr_id_token") || "";

    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Erro ao deletar sessão do Appwrite:", error);
    }

    clearClientSessionData();

    const ssoBaseUrl = process.env.NEXT_PUBLIC_GOVBR_SSO_URL;
    const realm = process.env.NEXT_PUBLIC_GOVBR_REALM;

    if (ssoBaseUrl && realm) {
      const redirectUri = encodeURIComponent(homeUrl);
      const logoutKeycloak = `${ssoBaseUrl}realms/${realm}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`;

      try {
        await fetch(logoutKeycloak, { method: "GET", mode: "no-cors" });
      } catch (error) {
        console.error("Erro ao fazer logout no Keycloak:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao executar fluxo de logout:", error);
  } finally {
    window.location.href = homeUrl;
  }
}
