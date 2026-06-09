import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNotificationsUnread } from "./get-notifications-unread";

describe("getNotificationsUnread", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notifications-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  it("deve retornar notificações não lidas", async () => {
    const mockNotifications = [
      {
        $id: "notification-1",
        receiver_id: "user-1",
        is_read: false,
        message: "Nova notificação",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: mockNotifications,
        total: 1,
      }),
    } as unknown as Response);

    const result = await getNotificationsUnread("user-1");

    expect(result).toEqual({
      documents: mockNotifications,
      total: 1,
    });
  });

  it("deve chamar a API corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getNotificationsUnread("user-1");

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/notifications-id/documents?"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      },
    );
  });

  it("deve filtrar apenas notificações não lidas", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getNotificationsUnread("user-1");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain('"receiver_id"');
    expect(decodedUrl).toContain('"user-1"');
    expect(decodedUrl).toContain('"is_read"');
    expect(decodedUrl).toContain("false");
  });

  it("deve ordenar por data decrescente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getNotificationsUnread("user-1");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain('"method":"orderDesc"');
    expect(decodedUrl).toContain('"attribute":"$createdAt"');
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    await expect(getNotificationsUnread("user-1")).rejects.toThrow(
      "Error: Erro interno",
    );
  });

  it("deve relançar erros inesperados", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(getNotificationsUnread("user-1")).rejects.toThrow(
      "Network Error",
    );
  });
});
