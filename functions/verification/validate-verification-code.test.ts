import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateVerificationCode } from "./validate-verification-code";

describe("validateVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("deve validar o código com sucesso", async () => {
    const mockResponse = {
      success: true,
      message: "Código validado",
      userId: "user-123",
      sessionSecret: "secret-123",
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await validateVerificationCode("user@test.com", "123456");

    expect(fetch).toHaveBeenCalledWith("/api/validate-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@test.com",
        code: "123456",
      }),
    });

    expect(result).toEqual(mockResponse);
  });

  it("deve retornar payload para status 401 sem lançar erro", async () => {
    const payload = {
      success: false,
      message: "Código inválido",
    };

    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue(payload),
    });

    const result = await validateVerificationCode("user@test.com", "000000");

    expect(result).toEqual(payload);
  });

  it("deve retornar payload para status 404 sem lançar erro", async () => {
    const payload = {
      success: false,
      message: "Código não encontrado",
    };

    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue(payload),
    });

    const result = await validateVerificationCode("user@test.com", "123456");

    expect(result).toEqual(payload);
  });

  it("deve retornar payload para status 410 sem lançar erro", async () => {
    const payload = {
      success: false,
      message: "Código expirado",
    };

    (fetch as any).mockResolvedValue({
      ok: false,
      status: 410,
      json: vi.fn().mockResolvedValue(payload),
    });

    const result = await validateVerificationCode("user@test.com", "123456");

    expect(result).toEqual(payload);
  });

  it("deve retornar payload para status 429 sem lançar erro", async () => {
    const payload = {
      success: false,
      message: "Muitas tentativas",
    };

    (fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue(payload),
    });

    const result = await validateVerificationCode("user@test.com", "123456");

    expect(result).toEqual(payload);
  });

  it("deve lançar erro para status não tratado", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        success: false,
        message: "Erro interno",
      }),
    });

    await expect(
      validateVerificationCode("user@test.com", "123456"),
    ).rejects.toThrow("Erro interno");
  });

  it("deve lançar erro padrão quando a API não retornar mensagem", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(
      validateVerificationCode("user@test.com", "123456"),
    ).rejects.toThrow("Erro ao validar codigo");
  });

  it("deve propagar erro de rede", async () => {
    const networkError = new Error("Network Error");

    (fetch as any).mockRejectedValue(networkError);

    await expect(
      validateVerificationCode("user@test.com", "123456"),
    ).rejects.toThrow("Network Error");
  });
});
