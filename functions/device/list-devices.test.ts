// list-devices.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listDevices } from "./list-devices";

describe("listDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve listar dispositivos com sucesso", async () => {
    const apiResponse = {
      documents: [
        {
          $id: "device-1",
          imei: "123456",
        },
      ],
      total: 1,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    }) as any;

    const result = await listDevices({
      userId: "user-123",
      limit: 10,
      page: 1,
    });

    expect(result).toEqual(apiResponse);
  });

  it("deve adicionar filtro auth_id para usuário comum", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDevices({
      userId: "user-123",
      limit: 10,
      page: 1,
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

    await listDevices({
      userId: "user-123",
      limit: 10,
      page: 1,
      isAdmin: true,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).not.toContain("auth_id");
  });

  it("deve enviar o limit corretamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDevices({
      userId: "user-123",
      limit: 25,
      page: 1,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("25");
  });

  it("deve calcular corretamente o offset", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listDevices({
      userId: "user-123",
      limit: 10,
      page: 3,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    // offset = (3 - 1) * 10 = 20
    expect(url).toContain("20");
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    await expect(
      listDevices({
        userId: "user-123",
        limit: 10,
        page: 1,
      }),
    ).rejects.toThrow("Erro ao listar dispositivos: Erro interno");
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      listDevices({
        userId: "user-123",
        limit: 10,
        page: 1,
      }),
    ).rejects.toThrow("Network Error");
  });

  it("deve registrar erro no console", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      listDevices({
        userId: "user-123",
        limit: 10,
        page: 1,
      }),
    ).rejects.toThrow("Network Error");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao listar dispositivos:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
