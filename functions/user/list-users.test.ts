import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listUsers } from "./list-users";

describe("listUsers", () => {
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
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve retornar usuários e total", async () => {
    const mockResponse = {
      documents: [
        {
          $id: "1",
          name: "João",
        },
        {
          $id: "2",
          name: "Maria",
        },
      ],
      total: 2,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const result = await listUsers(1, 10);

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve retornar valores padrão quando a API não retornar documents ou total", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);

    const result = await listUsers(1, 10);

    expect(result).toEqual({
      documents: [],
      total: 0,
    });
  });

  it("deve montar corretamente os parâmetros de paginação", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await listUsers(3, 10);

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("limit");
    expect(url).toContain("offset");
    expect(url).toContain("20"); // (3 - 1) * 10
  });

  it("deve enviar os headers corretos", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await listUsers(1, 10);

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

  it("deve lançar erro quando response.ok for false", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    await expect(listUsers(1, 10)).rejects.toThrow(
      "Erro ao buscar usuários: Erro interno",
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar usuários:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve propagar exceções do fetch", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const error = new Error("Falha de conexão");

    vi.mocked(fetch).mockRejectedValue(error);

    await expect(listUsers(1, 10)).rejects.toThrow("Falha de conexão");

    expect(consoleSpy).toHaveBeenCalledWith("Erro ao buscar usuários:", error);

    consoleSpy.mockRestore();
  });

  it("deve calcular offset zero para primeira página", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await listUsers(1, 25);

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("offset");
    expect(url).toContain("0");
  });
});
