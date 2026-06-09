import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateDistrict } from "./update-district";

describe("updateDistrict", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DISTRICT = "districts";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve atualizar o distrito com sucesso", async () => {
    const responseData = {
      $id: "district-123",
      theft_counter: 11,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    }) as any;

    const result = await updateDistrict("district-123", {
      theft_counter: 11,
    });

    expect(result).toEqual(responseData);
  });

  it("deve enviar os dados corretos no body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const data = {
      theft_counter: 11,
      robbery_counter: 3,
    };

    await updateDistrict("district-123", data);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data,
        }),
      }),
    );
  });

  it("deve utilizar o districtId na URL", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrict("district-123", {
      theft_counter: 11,
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("/documents/district-123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrict("district-123", {
      theft_counter: 11,
    });

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      body: expect.any(String),
      cache: "no-store",
    });
  });

  it("deve utilizar cache no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrict("district-123", {
      theft_counter: 11,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(
      updateDistrict("district-123", {
        theft_counter: 11,
      }),
    ).rejects.toThrow("Failed to update district: Internal Error");
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      updateDistrict("district-123", {
        theft_counter: 11,
      }),
    ).rejects.toThrow("Network Error");
  });

  it("deve registrar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(
      updateDistrict("district-123", {
        theft_counter: 11,
      }),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      updateDistrict("district-123", {
        theft_counter: 11,
      }),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve permitir atualizar apenas um contador", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    }) as any;

    await updateDistrict("district-123", {
      lost_counter: 8,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data: {
            lost_counter: 8,
          },
        }),
      }),
    );
  });
});
