// update-district-counters.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateDistrictCounters } from "./update-district-counters";
import { District } from "@/types";

describe("updateDistrictCounters", () => {
  const district: District = {
    $id: "district-123",
    theft_counter: 10,
    lost_counter: 5,
    robbery_counter: 3,
    $collectionId: "districts",
    $createdAt: "districts",
    $databaseId: "districts",
    $permissions: ["districts"],
    $updatedAt: "districts",
    area_km2: "districts",
    cod_UF: 100,
    cod_district: 100,
    cod_municipality: 100,
    cod_neighborhood: 100,
    cod_region: 100,
    cod_subdistrict: 100,
    name_UF: "districts",
    name_district: "districts",
    name_municipality: "districts",
    name_neighborhood: "districts",
    name_region: "districts",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_DISTRICT = "districts";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve incrementar theft_counter para Furto simples", async () => {
    const responseData = { success: true };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    }) as any;

    await updateDistrictCounters(district, "Furto simples");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data: {
            theft_counter: 11,
          },
        }),
      }),
    );
  });

  it("deve incrementar lost_counter para Extravio ou Perda", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrictCounters(district, "Extravio ou Perda");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data: {
            lost_counter: 6,
          },
        }),
      }),
    );
  });

  it("deve incrementar robbery_counter para Roubo", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrictCounters(district, "Roubo");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data: {
            robbery_counter: 4,
          },
        }),
      }),
    );
  });

  it("deve enviar objeto vazio para tipo desconhecido", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrictCounters(district, "Tipo Inexistente");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          data: {},
        }),
      }),
    );
  });

  it("deve retornar o json da API", async () => {
    const responseData = {
      success: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    }) as any;

    const result = await updateDistrictCounters(district, "Roubo");

    expect(result).toEqual(responseData);
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrictCounters(district, "Roubo");

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

    await updateDistrictCounters(district, "Roubo");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve utilizar o id correto do distrito na URL", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateDistrictCounters(district, "Roubo");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("/documents/district-123");
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    await expect(updateDistrictCounters(district, "Roubo")).rejects.toThrow(
      "Erro ao atualizar contadores do distrito",
    );
  });
});
