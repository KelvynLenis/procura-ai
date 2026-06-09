import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDeviceEvents, getAllDeviceEvents } from "./get-device-events";

describe("getDeviceEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_EVENTS = "events-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar eventos com sucesso", async () => {
    const events = [
      { $id: "1", type: "Roubo" },
      { $id: "2", type: "Recuperado" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: events,
      }),
    }) as any;

    const result = await getDeviceEvents("device-123");

    expect(result).toEqual(events);
  });

  it("deve utilizar isAlertOn=true por padrão", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceEvents("device-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("is_alert_on");
    expect(url).toContain("true");
  });

  it("deve utilizar isAlertOn informado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceEvents("device-123", false);

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("false");
  });

  it("deve ordenar por data desc", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceEvents("device-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("orderDesc");
    expect(url).toContain("$createdAt");
  });

  it("deve enviar headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getDeviceEvents("device-123");

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      cache: "no-store",
    });
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(getDeviceEvents("device-123")).rejects.toThrow(
      "Erro ao buscar eventos: Internal Error",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getDeviceEvents("device-123")).rejects.toThrow(
      "Network Error",
    );
  });

  it("deve registrar erro no console", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getDeviceEvents("device-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar eventos:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});

describe("getAllDeviceEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar todos os eventos do dispositivo", async () => {
    const events = [{ $id: "1" }, { $id: "2" }];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: events,
      }),
    }) as any;

    const result = await getAllDeviceEvents("device-123");

    expect(result).toEqual(events);
  });

  it("não deve incluir filtro is_alert_on", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getAllDeviceEvents("device-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).not.toContain("is_alert_on");
  });

  it("deve ordenar por data desc", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getAllDeviceEvents("device-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("orderDesc");
    expect(url).toContain("$createdAt");
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(getAllDeviceEvents("device-123")).rejects.toThrow(
      "Erro ao buscar eventos: Internal Error",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getAllDeviceEvents("device-123")).rejects.toThrow(
      "Network Error",
    );
  });

  it("deve registrar erro no console", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getAllDeviceEvents("device-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar eventos:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
