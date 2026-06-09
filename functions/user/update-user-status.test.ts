import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateUserStatus } from "./update-user-status";

describe("updateUserStatus", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com",
      NEXT_PUBLIC_DATABASE_ID: "database-id",
      NEXT_PUBLIC_COLLECTION_USER: "users-id",
      NEXT_PUBLIC_APP_WRITE_PROJECT_ID: "project-id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve atualizar o status do usuário com sucesso", async () => {
    const responseMock = {
      $id: "user-1",
      status: "Ativo",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseMock),
    });

    const result = await updateUserStatus("user-1", {
      status: "Ativo",
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/users-id/documents/user-1",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data: {
            status: "Ativo",
          },
        }),
      },
    );

    expect(result).toEqual(responseMock);
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    });

    await expect(
      updateUserStatus("user-1", {
        status: "Bloqueado",
      }),
    ).rejects.toThrow("Failed to update user status: Erro interno");
  });

  it("deve relançar erro de rede", async () => {
    const networkError = new Error("Network error");

    global.fetch = vi.fn().mockRejectedValue(networkError);

    await expect(
      updateUserStatus("user-1", {
        status: "Ativo",
      }),
    ).rejects.toThrow("Network error");
  });

  it("deve enviar o status informado corretamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await updateUserStatus("user-123", {
      status: "Pendente",
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(options?.body).toBe(
      JSON.stringify({
        data: {
          status: "Pendente",
        },
      }),
    );
  });
});
