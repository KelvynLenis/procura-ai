// get-geojson-data.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGeoJsonData } from "./getGeoJsonData";

describe("getGeoJsonData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar os dados GeoJSON com sucesso", async () => {
    const geoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Bairro Teste",
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geoJson,
    }) as any;

    const result = await getGeoJsonData("https://example.com/data.geojson");

    expect(result).toEqual(geoJson);
  });

  it("deve chamar fetch com a URL informada", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await getGeoJsonData("https://example.com/data.geojson");

    expect(fetch).toHaveBeenCalledWith("https://example.com/data.geojson");
  });

  it("deve lançar erro quando a resposta não for OK", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    }) as any;

    await expect(
      getGeoJsonData("https://example.com/data.geojson"),
    ).rejects.toThrow("Failed to fetch GeoJSON data: Not Found");
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      getGeoJsonData("https://example.com/data.geojson"),
    ).rejects.toThrow("Network Error");
  });

  it("deve registrar erro quando a resposta não for OK", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    }) as any;

    await expect(
      getGeoJsonData("https://example.com/data.geojson"),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching GeoJSON data:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(
      getGeoJsonData("https://example.com/data.geojson"),
    ).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching GeoJSON data:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
