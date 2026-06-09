import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { getNumberOfUsers } from "./get-number-of-users";

describe("getNumberOfUsers", () => {
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

  it("deve retornar o total de usuários quando a requisição for bem-sucedida", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [{ $id: "1" }, { $id: "2" }],
        total: 2,
      }),
    } as unknown as Response);

    const result = await getNumberOfUsers();

    expect(result).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve enviar os parâmetros de paginação corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getNumberOfUsers();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("queries%5B0%5D");
    expect(url).toContain("limit");
    expect(url).toContain("queries%5B1%5D");
    expect(url).toContain("offset");
  });

  it("deve percorrer múltiplas páginas quando houver mais usuários", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: Array.from({ length: 25 }, (_, i) => ({ $id: `${i}` })),
          total: 30,
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: Array.from({ length: 5 }, (_, i) => ({
            $id: `${i + 25}`,
          })),
          total: 30,
        }),
      } as unknown as Response);

    const result = await getNumberOfUsers();

    expect(result).toBe(30);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve retornar Infinity quando a primeira requisição falhar", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro na API"),
    } as unknown as Response);

    const result = await getNumberOfUsers();

    expect(result).toBe(Number.POSITIVE_INFINITY);
    expect(console.error).toHaveBeenCalled();
  });

  it("deve retornar Infinity quando fetch lançar exceção", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await getNumberOfUsers();

    expect(result).toBe(Number.POSITIVE_INFINITY);
    expect(console.error).toHaveBeenCalled();
  });

  it("deve enviar os headers corretos", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getNumberOfUsers();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      }),
    );
  });
});
