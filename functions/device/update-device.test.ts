// update-device.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateDevice } from "./update-device";

describe("updateDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  const mockDevice = {
    phone_number: "83999999999",
    phone_model: "Galaxy S24",
    brand: "Samsung",
    imei: "123456789012345",
    operator_id: "operator-123",
  } as any;

  it("deve atualizar o dispositivo com sucesso", async () => {
    const apiResponse = {
      $id: "device-123",
      phone_model: "Galaxy S24",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    }) as any;

    const result = await updateDevice("device-123", mockDevice, "user-123");

    expect(result).toEqual(apiResponse);
  });

  it("deve enviar os dados corretos para a API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDevice("device-123", mockDevice, "user-123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/devices/documents/device-123",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data: {
            auth_id: "user-123",
            phone_number: "83999999999",
            phone_model: "Galaxy S24",
            brand: "Samsung",
            imei: "123456789012345",
            is_stolen: false,
            operator_id: "operator-123",
          },
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
      updateDevice("device-123", mockDevice, "user-123"),
    ).rejects.toThrow("Dispositivo não encontrado");
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      updateDevice("device-123", mockDevice, "user-123"),
    ).rejects.toThrow("Network Error");
  });
});
