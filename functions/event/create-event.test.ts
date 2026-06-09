import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-event-id"),
}));

import { createEvent } from "./create-event";

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_EVENTS = "events-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  const eventData = {
    id_device: "device-123",
    time_event: "2025-01-01T10:00:00.000Z",
    description: "Celular roubado",
    type: "Roubo",
    is_alert_on: true,
    last_location: [-34.8, -7.1] as [number, number],
    id_district: "district-123",
  };

  it("deve criar evento com sucesso", async () => {
    const responseData = {
      $id: "mock-event-id",
      ...eventData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    }) as any;

    const result = await createEvent(eventData);

    expect(result).toEqual(responseData);
  });

  it("deve utilizar o uuid gerado como documentId", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createEvent(eventData);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          documentId: "mock-event-id",
          data: eventData,
        }),
      }),
    );
  });

  it("deve enviar os dados corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createEvent(eventData);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          documentId: "mock-event-id",
          data: eventData,
        }),
      }),
    );
  });

  it("deve utilizar a URL correta", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createEvent(eventData);

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("/collections/events-id/documents/");
  });

  it("deve enviar os headers corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createEvent(eventData);

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      body: expect.any(String),
    });
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(createEvent(eventData)).rejects.toThrow(
      "Failed to create event: Internal Error",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(createEvent(eventData)).rejects.toThrow("Network Error");
  });

  it("deve registrar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Internal Error",
    }) as any;

    await expect(createEvent(eventData)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve registrar erro quando ocorrer erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(createEvent(eventData)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve funcionar com campos opcionais preenchidos", async () => {
    const fullEventData = {
      ...eventData,
      retrieval_location: "Centro",
      address: "Rua Teste",
      admin_id: "admin-123",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    }) as any;

    await createEvent(fullEventData);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          documentId: "mock-event-id",
          data: fullEventData,
        }),
      }),
    );
  });
});
