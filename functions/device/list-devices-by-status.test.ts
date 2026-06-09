// list-devices-by-status.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listDevicesByStatus } from "./list-devices-by-status";

describe("listDevicesByStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve listar dispositivos com sucesso", async () => {
    const devices = [
      { $id: "1", imei: "111" },
      { $id: "2", imei: "222" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: devices,
        total: 2,
      }),
    }) as any;

    const result = await listDevicesByStatus({
      status: "active",
    });

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
          })),
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: Array.from({ length: 5 }, (_, i) => ({
            $id: `${i + 25}`,
          })),
          total: 30,
        }),
      });

    const result = await listDevicesByStatus({
      status: "active",
    });

    expect(result).toHaveLength(30);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve adicionar filtro auth_id para usuário comum", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDevicesByStatus({
      status: "active",
      userId: "user-123",
      isAdmin: false,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("auth_id");
    expect(url).toContain("user-123");
  });

  it("não deve adicionar filtro auth_id para admin", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDevicesByStatus({
      status: "active",
      userId: "user-123",
      isAdmin: true,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).not.toContain("auth_id");
  });

  it("deve retornar array vazio quando não houver dispositivos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    const result = await listDevicesByStatus({
      status: "active",
    });

    expect(result).toEqual([]);
  });

  it("deve interromper processamento quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    const result = await listDevicesByStatus({
      status: "active",
    });

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve interromper processamento em erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await listDevicesByStatus({
      status: "active",
    });

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
