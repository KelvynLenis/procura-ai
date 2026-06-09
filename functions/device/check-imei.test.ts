// check-imei.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkImei } from "./check-imei";

describe("checkImei", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DEVICE = "devices";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
    process.env.NEXT_PUBLIC_API_KEY_IMEICHECK = "api-key";
  });

  it("deve retornar erro quando o IMEI já existe", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          {
            imei: "123456789",
          },
        ],
      }),
    }) as any;

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: false,
      error: "Este IMEI já está cadastrado.",
    });
  });

  it("deve retornar válido quando o IMEI não existe", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: true,
    });
  });

  it("deve retornar erro quando a consulta ao banco falhar", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const result = await checkImei("123456789");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível verificar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve validar IMEI na API externa quando fabricante e modelo forem informados", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "succes",
          object: {
            brand: "Samsung",
            name: "Galaxy S23",
            model: "SM-S911B",
          },
        }),
      });

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: true,
    });
  });

  it("deve retornar erro quando fabricante não corresponder", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "succes",
          object: {
            brand: "Apple",
            name: "iPhone 15",
            model: "A3090",
          },
        }),
      });

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error: "O Fabricante informado não corresponde ao IMEI.",
    });
  });

  it("deve retornar erro quando modelo não corresponder", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "succes",
          object: {
            brand: "Samsung",
            name: "Galaxy S24",
            model: "SM-S921B",
          },
        }),
      });

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error: "O modelo informado não corresponde ao IMEI.",
    });
  });

  it("deve retornar erro quando a API externa retornar status inválido", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "error",
        }),
      });

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve retornar erro quando a API externa falhar", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });

  it("deve retornar erro quando ocorrer exceção na API externa", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      })
      .mockRejectedValueOnce(new Error("Network Error"));

    const result = await checkImei("123456789", "Samsung", "Galaxy S23");

    expect(result).toEqual({
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    });
  });
});
