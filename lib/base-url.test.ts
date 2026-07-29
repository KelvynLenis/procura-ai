import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildAppPath,
  getRequestOrigin,
  GOVBR_CALLBACK_PATH,
  normalizeBaseUrl,
  resolveBaseUrl,
  resolveGovBrRedirectUri,
} from "./base-url";

describe("base-url", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("normalizeBaseUrl", () => {
    it("adiciona https quando o protocolo estiver ausente", () => {
      expect(normalizeBaseUrl("procura-ai.vercel.app")).toBe(
        "https://procura-ai.vercel.app",
      );
    });

    it("preserva URLs que ja possuem protocolo", () => {
      expect(normalizeBaseUrl("https://procuraai.secties.pb.gov.br/")).toBe(
        "https://procuraai.secties.pb.gov.br",
      );
    });
  });

  describe("getRequestOrigin", () => {
    it("usa x-forwarded-host quando a request interna aponta para localhost", () => {
      const request = new Request(
        "http://localhost:3000/api/login-gov/auth-status",
        {
          headers: {
            host: "procuraai-homolog.secties.pb.gov.br",
            "x-forwarded-host": "procuraai-homolog.secties.pb.gov.br",
            "x-forwarded-proto": "https",
          },
        },
      );

      expect(getRequestOrigin(request)).toBe(
        "https://procuraai-homolog.secties.pb.gov.br",
      );
    });

    it("usa a origin publica da request na vercel", () => {
      const request = new Request(
        "https://procura-ai.vercel.app/api/login-gov/auth-status",
      );

      expect(getRequestOrigin(request)).toBe("https://procura-ai.vercel.app");
    });
  });

  describe("resolveBaseUrl", () => {
    it("ignora NEXT_PUBLIC_BASE_URL localhost quando ha request publica", () => {
      vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
      const request = new Request(
        "http://localhost:3000/api/login-gov/callback?code=abc",
        {
          headers: {
            "x-forwarded-host": "procura-ai.vercel.app",
            "x-forwarded-proto": "https",
          },
        },
      );

      expect(resolveBaseUrl(request)).toBe("https://procura-ai.vercel.app");
    });

    it("normaliza NEXT_PUBLIC_BASE_URL sem protocolo quando nao ha request", () => {
      vi.stubEnv("NEXT_PUBLIC_BASE_URL", "procura-ai.vercel.app");

      expect(resolveBaseUrl()).toBe("https://procura-ai.vercel.app");
    });
  });

  describe("resolveGovBrRedirectUri", () => {
    it("monta callback a partir da origin publica da request", () => {
      const request = new Request(
        "http://localhost:3000/api/login-gov/callback?code=abc",
        {
          headers: {
            "x-forwarded-host": "procura-ai.vercel.app",
            "x-forwarded-proto": "https",
          },
        },
      );

      expect(resolveGovBrRedirectUri(request)).toBe(
        `https://procura-ai.vercel.app${GOVBR_CALLBACK_PATH}`,
      );
    });

    it("ignora NEXT_PUBLIC_GOVBR_REDIRECT_URI localhost quando ha request", () => {
      vi.stubEnv(
        "NEXT_PUBLIC_GOVBR_REDIRECT_URI",
        "http://localhost:3000/api/login-gov/callback",
      );
      const request = new Request(
        "https://procura-ai.vercel.app/api/login-gov/callback?code=abc",
      );

      expect(resolveGovBrRedirectUri(request)).toBe(
        `https://procura-ai.vercel.app${GOVBR_CALLBACK_PATH}`,
      );
    });
  });

  describe("buildAppPath", () => {
    it("garante barra inicial para paths relativos", () => {
      expect(buildAppPath("perfil")).toBe("/perfil");
      expect(buildAppPath("/perfil")).toBe("/perfil");
    });
  });
});
