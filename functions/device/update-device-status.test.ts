// update-device-status.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDeviceStatus, updateDeviceStatus } from "./update-device-status";

describe("getDeviceStatus", () => {
  it("deve retornar Furtado para Furto simples", () => {
    expect(getDeviceStatus("Furto simples")).toBe("Furtado");
  });

  it("deve retornar Perdido para Extravio ou Perda", () => {
    expect(getDeviceStatus("Extravio ou Perda")).toBe("Perdido");
  });

  it("deve retornar Roubado para Roubo", () => {
    expect(getDeviceStatus("Roubo")).toBe("Roubado");
  });

  it("deve retornar Desconhecido para tipos inválidos", () => {
    expect(getDeviceStatus("Qualquer coisa")).toBe("Desconhecido");
  });

  it("deve retornar Desconhecido para string vazia", () => {
    expect(getDeviceStatus("")).toBe("Desconhecido");
  });
});

describe("updateDeviceStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve atualizar o status do dispositivo com sucesso", async () => {
    const apiResponse = {
      $id: "device-123",
      status: "Recuperado",
      is_stolen: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    }) as any;

    const result = await updateDeviceStatus("device-123", {
      is_stolen: false,
      status: "Recuperado",
    });

    expect(result).toEqual(apiResponse);
  });

  it("deve enviar os dados corretos para a API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const data = {
      is_stolen: false,
      status: "Recuperado",
    };

    await updateDeviceStatus("device-123", data);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/devices/documents/device-123",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data,
        }),
      },
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Dispositivo não encontrado",
    }) as any;

    await expect(
      updateDeviceStatus("device-123", {
        is_stolen: false,
        status: "Recuperado",
      }),
    ).rejects.toThrow(
      "Erro ao atualizar status do dispositivo: Dispositivo não encontrado",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      updateDeviceStatus("device-123", {
        is_stolen: false,
        status: "Recuperado",
      }),
    ).rejects.toThrow("Network Error");
  });

  it("deve registrar erro quando ocorrer falha da API", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Erro interno",
    }) as any;

    await expect(
      updateDeviceStatus("device-123", {
        is_stolen: false,
        status: "Recuperado",
      }),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao atualizar status do dispositivo:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      updateDeviceStatus("device-123", {
        is_stolen: false,
        status: "Recuperado",
      }),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao atualizar status do dispositivo:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
