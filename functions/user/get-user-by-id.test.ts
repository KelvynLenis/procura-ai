import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { getUserById } from "./get-user-by-id";

describe("getUserById", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com",
      NEXT_PUBLIC_DATABASE_ID: "database-id",
      NEXT_PUBLIC_COLLECTION_USER: "users-id",
      NEXT_PUBLIC_APP_WRITE_PROJECT_ID: "project-id",
    };

    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("deve retornar o usuário quando encontrado", async () => {
    const mockUser = {
      $id: "doc-1",
      user_id: "user-123",
      name: "João Silva",
      email: "joao@email.com",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [mockUser],
      }),
    } as unknown as Response);

    const result = await getUserById("user-123");

    expect(result).toEqual(mockUser);
  });

  it("deve buscar utilizando o campo user_id", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getUserById("user-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain('"attribute":"user_id"');
    expect(url).toContain('"values":["user-123"]');
  });

  it("deve enviar os headers corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [{}],
      }),
    } as unknown as Response);

    await getUserById("user-123");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      }),
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Usuário não encontrado"),
    } as unknown as Response);

    await expect(getUserById("user-123")).rejects.toThrow(
      "Erro ao listar dispositivos: Usuário não encontrado",
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("deve propagar erro quando fetch lançar exceção", async () => {
    const error = new Error("Network Error");

    vi.mocked(fetch).mockRejectedValue(error);

    await expect(getUserById("user-123")).rejects.toThrow("Network Error");

    expect(console.error).toHaveBeenCalledWith(
      "Erro ao listar dispositivos:",
      error,
    );
  });

  it("deve retornar o primeiro documento encontrado", async () => {
    const users = [
      {
        $id: "doc-1",
        user_id: "user-123",
        name: "Primeiro Usuário",
      },
      {
        $id: "doc-2",
        user_id: "user-123",
        name: "Segundo Usuário",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: users,
      }),
    } as unknown as Response);

    const result = await getUserById("user-123");

    expect(result).toEqual(users[0]);
  });

  it("deve retornar undefined quando nenhum usuário for encontrado", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    const result = await getUserById("user-123");

    expect(result).toBeUndefined();
  });

  it("deve montar a URL corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getUserById("user-123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://api.test.com/databases/database-id/collections/users-id/documents?",
      ),
      expect.any(Object),
    );
  });
});
