// create-session-from-token.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionFromToken } from "./create-session-from-token";

describe("createSessionFromToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve criar uma sessão com sucesso", async () => {
    const sessionResponse = {
      $id: "session-123",
      userId: "user-123",
      provider: "token",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sessionResponse,
    }) as any;

    const result = await createSessionFromToken("user-123", "secret-123");

    expect(result).toEqual(sessionResponse);
  });

  it("deve enviar os dados corretos para a API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createSessionFromToken("user-123", "secret-123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/account/sessions/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: "user-123",
          secret: "secret-123",
        }),
      },
    );
  });

  it("deve lançar erro retornado pela API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Token inválido",
    }) as any;

    await expect(
      createSessionFromToken("user-123", "secret-invalido"),
    ).rejects.toThrow("Token inválido");
  });

  it("deve lançar erro padrão quando a API não retornar mensagem", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "",
    }) as any;

    await expect(
      createSessionFromToken("user-123", "secret-invalido"),
    ).rejects.toThrow("Erro ao criar sessao");
  });
});
