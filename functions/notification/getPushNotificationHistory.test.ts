import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPushNotificationHistory } from "./getPushNotificationHistory";

describe("getPushNotificationHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notifications-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  it("deve retornar o histórico de notificações push", async () => {
    const mockNotifications = [
      {
        $id: "notification-1",
        type: "push",
        title: "Alerta 1",
      },
      {
        $id: "notification-2",
        type: "push",
        title: "Alerta 2",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: mockNotifications,
      }),
    } as unknown as Response);

    const result = await getPushNotificationHistory();

    expect(result).toEqual(mockNotifications);
  });

  it("deve chamar a API corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getPushNotificationHistory();

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

  it("deve filtrar apenas notificações do tipo push", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getPushNotificationHistory();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain('"attribute":"type"');
    expect(decodedUrl).toContain('"push"');
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    await expect(getPushNotificationHistory()).rejects.toThrow(
      "Error: Erro interno",
    );
  });

  it("deve propagar erro de rede", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(getPushNotificationHistory()).rejects.toThrow("Network Error");
  });
});
