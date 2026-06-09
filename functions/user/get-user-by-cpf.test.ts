import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { getUserByCPF } from "./get-user-by-cpf";

describe("getUserByCPF", () => {
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

  it("deve buscar usuário com CPF sem máscara", async () => {
    const mockUser = {
      $id: "user-1",
      name: "João Silva",
      cpf: "12345678901",
      email: "joao@email.com",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [mockUser],
      }),
    } as unknown as Response);

    const result = await getUserByCPF("12345678901");

    expect(result).toEqual(mockUser);

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("documents?");
    expect(url).toContain("12345678901");
    expect(url).toContain("123.456.789-01");
  });

  it("deve buscar usuário com CPF mascarado", async () => {
    const mockUser = {
      $id: "user-1",
      name: "Maria Silva",
      cpf: "123.456.789-01",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [mockUser],
      }),
    } as unknown as Response);

    const result = await getUserByCPF("123.456.789-01");

    expect(result).toEqual(mockUser);

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("12345678901");
    expect(url).toContain("123.456.789-01");
  });

  it("deve utilizar o CPF original quando não possuir 11 dígitos", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getUserByCPF("123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain('"values":["123"]');
  });

  it("deve enviar os headers corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [{}],
      }),
    } as unknown as Response);

    await getUserByCPF("12345678901");

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

    await expect(getUserByCPF("12345678901")).rejects.toThrow(
      "Error: Usuário não encontrado",
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("deve propagar erro quando fetch falhar", async () => {
    const error = new Error("Network Error");

    vi.mocked(fetch).mockRejectedValue(error);

    await expect(getUserByCPF("12345678901")).rejects.toThrow("Network Error");

    expect(console.error).toHaveBeenCalledWith(
      "Erro ao buscar usuário:",
      error,
    );
  });

  it("deve retornar o primeiro documento encontrado", async () => {
    const users = [
      { $id: "user-1", name: "Primeiro Usuário" },
      { $id: "user-2", name: "Segundo Usuário" },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: users,
      }),
    } as unknown as Response);

    const result = await getUserByCPF("12345678901");

    expect(result).toEqual(users[0]);
  });

  it("deve retornar undefined quando nenhum usuário for encontrado", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    const result = await getUserByCPF("12345678901");

    expect(result).toBeUndefined();
  });
});
