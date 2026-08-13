// check-imei.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./get-device-by-imei", () => ({
  getDeviceByImei: vi.fn(),
}));

vi.mock("../user/get-user-id", () => ({
  getUserId: vi.fn(),
}));

import { checkImei } from "./check-imei";
import { getDeviceByImei } from "./get-device-by-imei";
import { getUserId } from "../user/get-user-id";

describe("checkImei", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue("current-user");
  });

  it("deve retornar alreadyRegistered quando o IMEI pertence a outro usuário", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([
      {
        $id: "device-123",
        imei: "123456789",
        auth_id: "other-user",
      } as any,
    ]);

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: true,
      alreadyRegistered: true,
    });
  });

  it("deve retornar válido quando o IMEI não existe", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: true,
      isUpdate: undefined,
      deviceId: undefined,
    });
  });

  it("deve retornar erro quando a consulta ao banco falhar", async () => {
    vi.mocked(getDeviceByImei).mockRejectedValue(new Error("Erro ao verificar IMEI"));

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível verificar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve validar IMEI na API externa quando fabricante e modelo forem informados", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "succes",
        object: {
          brand: "Samsung",
          name: "Galaxy S23",
          model: "SM-S911B",
        },
      }),
    }) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: true,
    });
  });

  it("deve retornar erro quando fabricante não corresponder", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "succes",
        object: {
          brand: "Apple",
          name: "iPhone 15",
          model: "A3090",
        },
      }),
    }) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error: "O Fabricante informado não corresponde ao IMEI.",
    });
  });

  it("deve retornar erro quando modelo não corresponder", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "succes",
        object: {
          brand: "Samsung",
          name: "Galaxy S24",
          model: "SM-S921B",
        },
      }),
    }) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error: "O modelo informado não corresponde ao IMEI.",
    });
  });

  it("deve retornar erro quando a API externa retornar status inválido", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "error",
      }),
    }) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve retornar erro quando a API externa falhar", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve retornar erro quando ocorrer exceção na API externa", async () => {
    vi.mocked(getDeviceByImei).mockResolvedValue([]);

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });
});
