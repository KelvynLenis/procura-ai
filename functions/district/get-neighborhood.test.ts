// get-neighborhood.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNeighborhood } from "./get-neighborhood";

describe("getNeighborhood", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DISTRICT = "districts";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar o bairro encontrado", async () => {
    const neighborhood = {
      $id: "bairro-123",
      name: "Manaíra",
      cod_neighborhood: 100,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [neighborhood],
      }),
    }) as any;

    const result = await getNeighborhood("bairro-123");

    expect(result).toEqual(neighborhood);
  });

  it("deve retornar o primeiro documento da resposta", async () => {
    const firstNeighborhood = {
      $id: "bairro-1",
      name: "Manaíra",
    };

    const secondNeighborhood = {
      $id: "bairro-2",
      name: "Tambaú",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [firstNeighborhood, secondNeighborhood],
      }),
    }) as any;

    const result = await getNeighborhood("bairro-1");

    expect(result).toEqual(firstNeighborhood);
  });

  it("deve montar a query utilizando o id do bairro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getNeighborhood("bairro-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("$id");
    expect(url).toContain("bairro-123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getNeighborhood("bairro-123");

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
      }),
    }) as any;

    await getNeighborhood("bairro-123");

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
      text: async () => "Bairro não encontrado",
    }) as any;

    await expect(getNeighborhood("bairro-123")).rejects.toThrow(
      "Failed to fetch neighborhood: Bairro não encontrado",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getNeighborhood("bairro-123")).rejects.toThrow(
      "Network Error",
    );
  });

  it("deve registrar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    await expect(getNeighborhood("bairro-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getNeighborhood("bairro-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
