import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRecoveredDevices } from "./list-recovered-devices";

describe("listRecoveredDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_EVENTS = "events-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar eventos recuperados quando existir apenas uma página", async () => {
    const events = [
      { $id: "1", type: "Recuperado" },
      { $id: "2", type: "Recuperado" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: events,
        total: 2,
      }),
    }) as any;

    const result = await listRecoveredDevices();

    expect(result).toEqual(events);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve buscar múltiplas páginas", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "2" }],
          total: 30,
        }),
      });

    const result = await listRecoveredDevices();

    expect(result).toEqual([{ $id: "1" }, { $id: "2" }]);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("deve utilizar filtro type=Recuperado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listRecoveredDevices();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain('"attribute":"type"');
    expect(url).toContain("Recuperado");
  });

  it("deve incluir limit e offset na query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listRecoveredDevices();

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("limit");
    expect(url).toContain("offset");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listRecoveredDevices();

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      cache: "no-store",
    });
  });

  it("deve utilizar cache no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
        total: 0,
      }),
    }) as any;

    await listRecoveredDevices();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("deve retornar array vazio quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    const result = await listRecoveredDevices();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar resultados acumulados quando a segunda página falhar", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 50,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "Internal Error",
      });

    const result = await listRecoveredDevices();

    expect(result).toEqual([{ $id: "1" }]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar array vazio quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    const result = await listRecoveredDevices();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve utilizar offset 25 na segunda página", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "1" }],
          total: 30,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [{ $id: "2" }],
          total: 30,
        }),
      });

    await listRecoveredDevices();

    const secondUrl = decodeURIComponent(
      vi.mocked(fetch).mock.calls[1][0] as string,
    );

    expect(secondUrl).toContain("25");
  });
});
