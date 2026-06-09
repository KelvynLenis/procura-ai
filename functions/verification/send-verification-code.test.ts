import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendVerificationCode } from "./send-verification-code";

describe("sendVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("deve enviar o código de verificação com sucesso", async () => {
    const mockResponse = {
      success: true,
      message: "Código enviado com sucesso",
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await sendVerificationCode(
      "user@test.com",
      "user-123",
      "João",
    );

    expect(fetch).toHaveBeenCalledWith("/api/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@test.com",
        userId: "user-123",
        userName: "João",
      }),
    });

    expect(result).toEqual(mockResponse);
  });

  it("deve funcionar sem userName", async () => {
    const mockResponse = {
      success: true,
      message: "Código enviado com sucesso",
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    await sendVerificationCode("user@test.com", "user-123");

    expect(fetch).toHaveBeenCalledWith("/api/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@test.com",
        userId: "user-123",
        userName: undefined,
      }),
    });
  });

  it("deve lançar erro retornado pela API", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        success: false,
        message: "Falha ao enviar código",
      }),
    });

    await expect(
      sendVerificationCode("user@test.com", "user-123"),
    ).rejects.toThrow("Falha ao enviar código");
  });

  it("deve lançar erro padrão quando a API não retornar mensagem", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(
      sendVerificationCode("user@test.com", "user-123"),
    ).rejects.toThrow("Erro ao enviar codigo");
  });

  it("deve propagar erro de rede", async () => {
    const networkError = new Error("Network Error");

    (fetch as any).mockRejectedValue(networkError);

    await expect(
      sendVerificationCode("user@test.com", "user-123"),
    ).rejects.toThrow("Network Error");
  });
});
