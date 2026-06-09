// delete-device.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDevice } from "./delete-device";

describe("deleteDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices-collection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve deletar um dispositivo com sucesso", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    }) as any;

    const result = await deleteDevice("device-123");

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve enviar a requisição DELETE corretamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    }) as any;

    await deleteDevice("device-123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/devices-collection/documents/device-123",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      },
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Dispositivo não encontrado",
    }) as any;

    await expect(deleteDevice("device-123")).rejects.toThrow(
      "Erro ao deletar dispositivo: Dispositivo não encontrado",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(deleteDevice("device-123")).rejects.toThrow("Network Error");
  });

  it("deve registrar erro no console quando ocorrer falha", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(deleteDevice("device-123")).rejects.toThrow("Network Error");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao deletar dispositivo:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
