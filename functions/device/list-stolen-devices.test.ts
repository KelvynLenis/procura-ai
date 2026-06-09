// list-stolen-devices.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listStolenDevices } from "./list-stolen-devices";

describe("listStolenDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve listar dispositivos roubados com sucesso", async () => {
    const devices = [
      {
        $id: "1",
        imei: "111111111111111",
        is_stolen: true,
      },
      {
        $id: "2",
        imei: "222222222222222",
        is_stolen: true,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: devices,
        total: 2,
      }),
    }) as any;

    const result = await listStolenDevices();

    expect(result).toEqual(devices);
  });

  it("deve buscar múltiplas páginas", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 25 }, (_, i) => ({
            $id: `${i}`,
            is_stolen: true,
          })),
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 5 }, (_, i) => ({
            $id: `${i + 25}`,
            is_stolen: true,
          })),
          total: 30,
        }),
      });

    const result = await listStolenDevices();

    expect(result).toHaveLength(30);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve aplicar filtro de dispositivos roubados", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listStolenDevices();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("is_stolen");
    expect(url).toContain("true");
  });

  it("deve enviar cache no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listStolenDevices();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve retornar array vazio quando não houver dispositivos roubados", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    const result = await listStolenDevices();

    expect(result).toEqual([]);
  });

  it("deve interromper processamento quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    const result = await listStolenDevices();

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve interromper processamento quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await listStolenDevices();

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve utilizar offset corretamente na segunda página", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 25 }, (_, i) => ({
            $id: `${i}`,
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

    await listStolenDevices();

    const secondUrl = vi.mocked(fetch).mock.calls[1][0] as string;

    expect(secondUrl).toContain("25");
  });
});
