import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateUser } from "./update-user";

describe("updateUser", () => {
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

  it("deve atualizar usuário com sucesso", async () => {
    const responseMock = {
      $id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      cpf: "12345678900",
      img_url: "https://image.com/photo.jpg",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseMock),
    });

    const payload = {
      name: "João Silva",
      email: "joao@email.com",
      cpf: "12345678900",
      img_url: "https://image.com/photo.jpg",
    };

    const result = await updateUser("user-1", payload);

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
          data: payload,
        }),
      },
    );

    expect(result).toEqual(responseMock);
  });

  it("deve atualizar usuário sem img_url", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    await updateUser("user-1", {
      name: "Maria",
      email: "maria@email.com",
      cpf: "98765432100",
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(options?.body).toBe(
      JSON.stringify({
        data: {
          name: "Maria",
          email: "maria@email.com",
          cpf: "98765432100",
        },
      }),
    );
  });

  it("deve permitir img_url nulo", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    await updateUser("user-1", {
      name: "Maria",
      email: "maria@email.com",
      cpf: "98765432100",
      img_url: null,
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(options?.body).toBe(
      JSON.stringify({
        data: {
          name: "Maria",
          email: "maria@email.com",
          cpf: "98765432100",
          img_url: null,
        },
      }),
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Usuário não encontrado"),
    });

    await expect(
      updateUser("user-inexistente", {
        name: "João",
        email: "joao@email.com",
        cpf: "12345678900",
      }),
    ).rejects.toThrow("Failed to update user status: Usuário não encontrado");
  });

  it("deve relançar erro de rede", async () => {
    const networkError = new Error("Network error");

    global.fetch = vi.fn().mockRejectedValue(networkError);

    await expect(
      updateUser("user-1", {
        name: "João",
        email: "joao@email.com",
        cpf: "12345678900",
      }),
    ).rejects.toThrow("Network error");
  });

  it("deve usar o endpoint correto", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await updateUser("abc-123", {
      name: "Teste",
      email: "teste@email.com",
      cpf: "11122233344",
    });

    const [url] = vi.mocked(fetch).mock.calls[0];

    expect(url).toBe(
      "https://api.test.com/databases/database-id/collections/users-id/documents/abc-123",
    );
  });
});
