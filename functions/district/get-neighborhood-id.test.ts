// get-neighborhood-id.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNeighborhoodId } from "./get-neighborhood-id";

describe("getNeighborhoodId", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DISTRICT = "districts";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar o id do bairro encontrado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          {
            $id: "bairro-123",
            cod_neighborhood: 100,
          },
        ],
      }),
    }) as any;

    const result = await getNeighborhoodId(100);

    expect(result).toBe("bairro-123");
  });

  it("deve montar a query utilizando o código do bairro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await expect(getNeighborhoodId(123)).rejects.toThrow();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("cod_neighborhood");
    expect(url).toContain("123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          {
            $id: "bairro-123",
          },
        ],
      }),
    }) as any;

    await getNeighborhoodId(100);

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
        documents: [
          {
            $id: "bairro-123",
          },
        ],
      }),
    }) as any;

    await getNeighborhoodId(100);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow(
      "Erro ao buscar bairro",
    );
  });

  it("deve lançar erro quando nenhum bairro for encontrado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow(
      "Bairro não encontrado",
    );
  });

  it("deve lançar erro quando documents for undefined", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow(
      "Bairro não encontrado",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow("Network Error");
  });

  it("deve registrar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar bairro:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getNeighborhoodId(100)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar bairro:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
