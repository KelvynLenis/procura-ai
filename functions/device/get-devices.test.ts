// get-devices.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDevices } from "./get-devices";

describe("getDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar dispositivos com sucesso", async () => {
    const devices = [
      {
        $id: "1",
        imei: "123",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: devices,
        total: 1,
      }),
    }) as any;

    const result = await getDevices();

    expect(result).toEqual(devices);
  });

  it("deve aplicar filtro is_stolen quando nenhum filtro for informado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await getDevices();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("is_stolen");
    expect(url).toContain("true");
  });

  it("deve utilizar filtros customizados quando informados", async () => {
    const filters = [
      {
        method: "equal",
        attribute: "status",
        values: ["Roubado"],
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await getDevices({ filters });

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("status");
    expect(url).toContain("Roubado");

    expect(url).not.toContain("is_stolen");
  });

  it("deve buscar múltiplas páginas", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 25 }, (_, index) => ({
            $id: `${index}`,
          })),
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 5 }, (_, index) => ({
            $id: `${index + 25}`,
          })),
          total: 30,
        }),
      });

    const result = await getDevices();

    expect(result).toHaveLength(30);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve utilizar offset corretamente na segunda página", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 25 }, (_, index) => ({
            $id: `${index}`,
          })),
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
          total: 30,
        }),
      });

    await getDevices();

    const secondUrl = vi.mocked(fetch).mock.calls[1][0] as string;

    expect(secondUrl).toContain("25");
  });

  it("deve enviar cache no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await getDevices();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve retornar array vazio quando não houver dispositivos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    const result = await getDevices();

    expect(result).toEqual([]);
  });

  it("deve interromper o processamento quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    const result = await getDevices();

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve interromper o processamento quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await getDevices();

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve adicionar limit na query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await getDevices();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("limit");
  });

  it("deve adicionar offset na query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await getDevices();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("offset");
  });
});
