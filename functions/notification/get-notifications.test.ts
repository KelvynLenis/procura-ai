import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNotifications } from "./get-notifications";

describe("getNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notifications-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  it("deve retornar as notificações do usuário", async () => {
    const mockNotifications = [
      {
        $id: "notification-1",
        receiver_id: "user-1",
        message: "Mensagem 1",
      },
      {
        $id: "notification-2",
        receiver_id: "user-1",
        message: "Mensagem 2",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: mockNotifications,
      }),
    } as unknown as Response);

    const result = await getNotifications("user-1");

    expect(result).toEqual(mockNotifications);
  });

  it("deve chamar a API corretamente", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getNotifications("user-1");

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

  it("deve filtrar pelo receiver_id informado", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as unknown as Response);

    await getNotifications("user-1");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain('"receiver_id"');
    expect(decodedUrl).toContain('"user-1"');
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    await expect(getNotifications("user-1")).rejects.toThrow(
      "Error: Erro interno",
    );
  });

  it("deve propagar erro de rede", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(getNotifications("user-1")).rejects.toThrow("Network Error");
  });
});
