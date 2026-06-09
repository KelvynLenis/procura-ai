import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEventById } from "./get-event-by-id";

describe("getEventById", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_EVENTS = "events-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar o evento encontrado", async () => {
    const event = {
      $id: "event-123",
      type: "Roubo",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [event],
      }),
    }) as any;

    const result = await getEventById("event-123");

    expect(result).toEqual(event);
  });

  it("deve montar a URL utilizando o id informado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getEventById("event-123");

    const url = decodeURIComponent(vi.mocked(fetch).mock.calls[0][0] as string);

    expect(url).toContain("$id");
    expect(url).toContain("event-123");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await getEventById("event-123");

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });
  });

  it("deve registrar os detalhes do alerta no console", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const documents = [
      {
        $id: "event-123",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents,
      }),
    }) as any;

    await getEventById("event-123");

    expect(consoleSpy).toHaveBeenCalledWith("Detalhes do alerta:", documents);

    consoleSpy.mockRestore();
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(getEventById("event-123")).rejects.toThrow(
      "Failed to fetch events: Error: Failed to fetch events: Internal Error",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getEventById("event-123")).rejects.toThrow(
      "Failed to fetch events: Error: Network Error",
    );
  });

  it("deve registrar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(getEventById("event-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(getEventById("event-123")).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar undefined quando não existir documento", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    const result = await getEventById("event-123");

    expect(result).toBeUndefined();
  });
});
