import { beforeEach, describe, expect, it, vi } from "vitest";

import { getNotificationsRead } from "./get-notifications-read";

describe("getNotificationsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notifications-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar notificações lidas com sucesso", async () => {
    const mockNotifications = [
      {
        $id: "notification-1",
        receiver_id: "user-1",
        is_read: true,
        message: "Mensagem 1",
      },
      {
        $id: "notification-2",
        receiver_id: "user-1",
        is_read: true,
        message: "Mensagem 2",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: mockNotifications,
        total: 2,
      }),
    } as Response);

    const result = await getNotificationsRead("user-1");

    expect(result).toEqual({
      documents: mockNotifications,
      total: 2,
    });
  });

  it("deve chamar fetch com a URL correta", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as Response);

    await getNotificationsRead("user-1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/databases/database-id/collections/notifications-id/documents?",
      ),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      },
    );
  });

  it("deve incluir receiver_id na query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as Response);

    await getNotificationsRead("user-123");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("receiver_id");
    expect(url).toContain("user-123");
  });

  it("deve filtrar apenas notificações lidas", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as Response);

    await getNotificationsRead("user-1");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("is_read");
    expect(url).toContain("true");
  });

  it("deve ordenar por data decrescente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as Response);

    await getNotificationsRead("user-1");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain("orderDesc");
    expect(decodedUrl).toContain("$createdAt");
  });

  it("deve lançar erro quando response.ok for false", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro Appwrite"),
    } as Response);

    await expect(getNotificationsRead("user-1")).rejects.toThrow(
      "Error: Erro Appwrite",
    );
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    await expect(getNotificationsRead("user-1")).rejects.toThrow(
      "Network Error",
    );
  });

  it("deve registrar erro no console quando ocorrer exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("Erro inesperado"));

    await expect(getNotificationsRead("user-1")).rejects.toThrow(
      "Erro inesperado",
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching notifications:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve retornar lista vazia", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as Response);

    const result = await getNotificationsRead("user-1");

    expect(result).toEqual({
      documents: [],
      total: 0,
    });
  });

  it("deve chamar response.json()", async () => {
    const jsonMock = vi.fn().mockResolvedValue({
      documents: [],
      total: 0,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: jsonMock,
    } as Response);

    await getNotificationsRead("user-1");

    expect(jsonMock).toHaveBeenCalled();
  });
});
