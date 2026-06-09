// get-device-by-id.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDeviceById } from "./get-device-by-id";

describe("getDeviceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices-collection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar o dispositivo encontrado", async () => {
    const mockDevice = {
      $id: "device-123",
      phone_model: "Galaxy S24",
      brand: "Samsung",
      imei: "123456789012345",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [mockDevice],
      }),
    }) as any;

    const result = await getDeviceById("device-123");

    expect(result).toEqual(mockDevice);
  });

  it("deve enviar a consulta com o filtro por id", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceById("device-123");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("documents?");
    expect(url).toContain("%24id");
    expect(url).toContain("device-123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceById("device-123");

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
      text: async () => "Dispositivo não encontrado",
    }) as any;

    await expect(getDeviceById("device-123")).rejects.toThrow(
      "Erro ao listar dispositivos: Dispositivo não encontrado",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getDeviceById("device-123")).rejects.toThrow("Network Error");
  });

  it("deve registrar erro no console quando ocorrer falha", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getDeviceById("device-123")).rejects.toThrow("Network Error");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao listar dispositivos:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
