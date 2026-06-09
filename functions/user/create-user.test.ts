import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUser } from "./create-user";

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_USER = "users-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  const mockUser = {
    userId: "user-123",
    name: "João Silva",
    cpf: "12345678900",
    email: "joao@email.com",
    password: "123456",
  };

  it("deve criar conta e usuário com sucesso", async () => {
    const authResponse = {
      $id: "auth-user-id",
    };

    const userDocument = {
      $id: "user-123",
      name: "João Silva",
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(authResponse),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(userDocument),
      } as any);

    const result = await createUser(mockUser);

    expect(result).toEqual(userDocument);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve chamar o endpoint de criação de conta corretamente", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          $id: "auth-user-id",
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

    await createUser(mockUser);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toBe("https://api.test.com/account");

    expect(options).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });

    expect(JSON.parse(options?.body as string)).toEqual({
      userId: "user-123",
      email: "joao@email.com",
      password: "123456",
    });
  });

  it("deve chamar o endpoint de criação do documento do usuário corretamente", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          $id: "auth-user-id",
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

    await createUser(mockUser);

    const [url, options] = vi.mocked(fetch).mock.calls[1];

    expect(url).toBe(
      "https://api.test.com/databases/database-id/collections/users-id/documents",
    );

    expect(options?.method).toBe("POST");

    expect(JSON.parse(options?.body as string)).toEqual({
      documentId: "user-123",
      data: {
        user_id: "auth-user-id",
        name: "João Silva",
        cpf: "12345678900",
        email: "joao@email.com",
      },
    });
  });

  it("deve lançar erro quando falhar a criação da conta", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue("Email já cadastrado"),
    } as any);

    await expect(createUser(mockUser)).rejects.toThrow(
      "Erro ao criar conta: Email já cadastrado",
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve lançar erro quando falhar a criação do documento do usuário", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          $id: "auth-user-id",
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        text: vi.fn().mockResolvedValue("Erro ao salvar usuário"),
      } as any);

    await expect(createUser(mockUser)).rejects.toThrow(
      "Erro ao criar usuário: Erro ao salvar usuário",
    );

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve propagar erro de rede na primeira requisição", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(createUser(mockUser)).rejects.toThrow("Network Error");

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve propagar erro de rede na segunda requisição", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          $id: "auth-user-id",
        }),
      } as any)
      .mockRejectedValueOnce(new Error("Database Error"));

    await expect(createUser(mockUser)).rejects.toThrow("Database Error");

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve usar o id retornado pela autenticação como user_id", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          $id: "appwrite-auth-id",
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

    await createUser(mockUser);

    const [, options] = vi.mocked(fetch).mock.calls[1];
    const body = JSON.parse(options?.body as string);

    expect(body.data.user_id).toBe("appwrite-auth-id");
  });
});
