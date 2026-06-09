import { beforeEach, describe, expect, it, vi } from "vitest";
import { markNotificationsAsRead } from "./mark-as-read";

describe("markNotificationsAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notifications-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  it("deve marcar uma notificação como lida", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    const result = await markNotificationsAsRead("notification-1");

    expect(result).toEqual({
      ok: true,
    });
  });

  it("deve chamar a API corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    await markNotificationsAsRead("notification-1");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/notifications-id/documents/notification-1",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data: {
            is_read: true,
          },
        }),
      },
    );
  });

  it("deve retornar ok=true quando a atualização for realizada", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    const result = await markNotificationsAsRead("notification-1");

    expect(result.ok).toBe(true);
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro ao atualizar"),
    } as unknown as Response);

    await expect(markNotificationsAsRead("notification-1")).rejects.toThrow(
      "Error: Erro ao atualizar",
    );
  });

  it("deve propagar erro de rede", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(markNotificationsAsRead("notification-1")).rejects.toThrow(
      "Network Error",
    );
  });

  it("deve enviar is_read=true no body da requisição", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    await markNotificationsAsRead("notification-1");

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(JSON.parse((options as RequestInit).body as string)).toEqual({
      data: {
        is_read: true,
      },
    });
  });
});
