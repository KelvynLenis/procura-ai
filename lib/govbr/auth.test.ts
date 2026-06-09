import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAuthState, exchangeCodeForToken, getUserInfo } from "./auth";
import { v4 as uuidv4 } from "uuid";
import { getGovBrConfig, buildTokenUrl, buildUserInfoUrl } from "./config";

vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

vi.mock("./config", () => ({
  getGovBrConfig: vi.fn(),
  buildTokenUrl: vi.fn(),
  buildUserInfoUrl: vi.fn(),
}));

describe("Gov.br Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("generateAuthState", () => {
    it("deve gerar um UUID", () => {
      (uuidv4 as any).mockReturnValue("mocked-uuid");

      const result = generateAuthState();

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(result).toBe("mocked-uuid");
    });
  });

  describe("exchangeCodeForToken", () => {
    beforeEach(() => {
      (getGovBrConfig as any).mockReturnValue({
        clientId: "client-id",
        clientSecret: "client-secret",
        redirectUri: "http://localhost/callback",
      });

      (buildTokenUrl as any).mockReturnValue("https://gov.br/oauth/token");
    });

    it("deve trocar código por token com sucesso", async () => {
      const tokenResponse = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        id_token: "id-token",
        expires_in: 3600,
        token_type: "Bearer",
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(tokenResponse),
      });

      const result = await exchangeCodeForToken("auth-code");

      const expectedAuth = Buffer.from("client-id:client-secret").toString(
        "base64",
      );

      expect(fetch).toHaveBeenCalledWith("https://gov.br/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${expectedAuth}`,
        },
        body: expect.stringContaining("grant_type=authorization_code"),
      });

      expect(result).toEqual(tokenResponse);
    });

    it("deve lançar erro se clientId estiver ausente", async () => {
      (getGovBrConfig as any).mockReturnValue({
        clientId: "",
        clientSecret: "secret",
        redirectUri: "callback",
      });

      await expect(exchangeCodeForToken("auth-code")).rejects.toThrow(
        "Configurações incompletas para troca de token",
      );
    });

    it("deve lançar erro se clientSecret estiver ausente", async () => {
      (getGovBrConfig as any).mockReturnValue({
        clientId: "client-id",
        clientSecret: "",
        redirectUri: "callback",
      });

      await expect(exchangeCodeForToken("auth-code")).rejects.toThrow(
        "Configurações incompletas para troca de token",
      );
    });

    it("deve lançar erro se redirectUri estiver ausente", async () => {
      (getGovBrConfig as any).mockReturnValue({
        clientId: "client-id",
        clientSecret: "secret",
        redirectUri: "",
      });

      await expect(exchangeCodeForToken("auth-code")).rejects.toThrow(
        "Configurações incompletas para troca de token",
      );
    });

    it("deve lançar erro quando a API retornar erro", async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue("invalid_grant"),
      });

      await expect(exchangeCodeForToken("invalid-code")).rejects.toThrow(
        "Erro na troca de token: invalid_grant",
      );
    });

    it("deve propagar erro de rede", async () => {
      (fetch as any).mockRejectedValue(new Error("Network Error"));

      await expect(exchangeCodeForToken("auth-code")).rejects.toThrow(
        "Network Error",
      );
    });
  });

  describe("getUserInfo", () => {
    beforeEach(() => {
      (buildUserInfoUrl as any).mockReturnValue("https://gov.br/userinfo");
    });

    it("deve buscar informações do usuário", async () => {
      const userInfo = {
        sub: "123",
        email: "user@test.com",
        name: "Usuário Teste",
        preferred_username: "usuario",
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(userInfo),
      });

      const result = await getUserInfo("access-token");

      expect(fetch).toHaveBeenCalledWith("https://gov.br/userinfo", {
        headers: {
          Authorization: "Bearer access-token",
        },
      });

      expect(result).toEqual(userInfo);
    });

    it("deve lançar erro quando a API retornar erro", async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue("unauthorized"),
      });

      await expect(getUserInfo("invalid-token")).rejects.toThrow(
        "Erro ao obter informações do usuário: unauthorized",
      );
    });

    it("deve propagar erro de rede", async () => {
      (fetch as any).mockRejectedValue(new Error("Network Error"));

      await expect(getUserInfo("access-token")).rejects.toThrow(
        "Network Error",
      );
    });
  });
});
