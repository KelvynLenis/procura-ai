// list-districts.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listDistricts } from "./list-districts";

describe("listDistricts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DISTRICT = "districts";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar distritos quando existir apenas uma página", async () => {
    const districts = [
      { $id: "1", name: "Centro" },
      { $id: "2", name: "Manaíra" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: districts,
        total: 2,
      }),
    }) as any;

    const result = await listDistricts();

    expect(result).toEqual(districts);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve buscar múltiplas páginas", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "2" }],
          total: 30,
        }),
      });

    const result = await listDistricts();

    expect(result).toEqual([{ $id: "1" }, { $id: "2" }]);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDistricts();

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      cache: "no-store",
    });
  });

  it("deve utilizar cache no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDistricts();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve montar query com limit e offset", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDistricts();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("limit");
    expect(url).toContain("offset");
  });

  it("deve parar e retornar lista vazia quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    const result = await listDistricts();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve parar e retornar resultados acumulados quando uma página falhar", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 50,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "Erro",
      });

    const result = await listDistricts();

    expect(result).toEqual([{ $id: "1" }]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve parar quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await listDistricts();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve utilizar offset 25 na segunda página", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "2" }],
          total: 30,
        }),
      });

    await listDistricts();

    const secondCallUrl = decodeURIComponent(
      vi.mocked(fetch).mock.calls[1][0] as string,
    );

    expect(secondCallUrl).toContain("25");
  });
});
