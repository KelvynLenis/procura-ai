// list-user-devices.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listUserDevices } from "./list-user-devices";

describe("listUserDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar os dispositivos do usuário", async () => {
    const devices = [
      {
        $id: "device-1",
        imei: "123456789",
      },
      {
        $id: "device-2",
        imei: "987654321",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: devices,
      }),
    }) as any;

    const result = await listUserDevices("user-123");

    expect(result).toEqual(devices);
  });

  it("deve retornar array vazio quando documents não existir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const result = await listUserDevices("user-123");

    expect(result).toEqual([]);
  });

  it("deve montar a query utilizando auth_id", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await listUserDevices("user-123");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("auth_id");
    expect(url).toContain("user-123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await listUserDevices("user-123");

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    await expect(listUserDevices("user-123")).rejects.toThrow(
      "Error: Erro interno",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(listUserDevices("user-123")).rejects.toThrow("Network Error");
  });

  it("deve registrar erro no console quando ocorrer erro da API", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    await expect(listUserDevices("user-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar dispositivos do usuário:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve registrar erro no console quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(listUserDevices("user-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar dispositivos do usuário:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
