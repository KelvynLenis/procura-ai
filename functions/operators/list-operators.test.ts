import { describe, it, expect, vi, beforeEach } from "vitest";
import { listOperators } from "./list-operators";

global.fetch = vi.fn();

describe("listOperators", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_OPERATORS = "operators-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar operadores quando a requisição for bem sucedida", async () => {
    const operators = [
      {
        $id: "op-1",
        name: "Vivo",
      },
      {
        $id: "op-2",
        name: "TIM",
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: operators,
        total: 2,
      }),
    } as any);

    const result = await listOperators();

    expect(result).toEqual(operators);
  });

  it("deve buscar múltiplas páginas quando total for maior que limit", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "op-1" }],
          total: 30,
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "op-2" }],
          total: 30,
        }),
      } as any);

    const result = await listOperators();

    expect(fetch).toHaveBeenCalledTimes(2);

    expect(result).toEqual([{ $id: "op-1" }, { $id: "op-2" }]);
  });

  it("deve retornar array vazio quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as any);

    const result = await listOperators();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar array vazio quando fetch lançar exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"));

    const result = await listOperators();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve enviar os parâmetros de paginação corretamente", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as any);

    await listOperators();

    const [url] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain("queries");
    expect(url).toContain("limit");
    expect(url).toContain("offset");
  });

  it("deve enviar os headers corretamente", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as any);

    await listOperators();

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
