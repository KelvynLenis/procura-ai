import { beforeEach, describe, expect, it, vi } from "vitest";

import { createNotification } from "./create-notification";
import { ID } from "appwrite";

vi.mock("appwrite", () => ({
  ID: {
    unique: vi.fn(),
  },
}));

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION = "notification-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    vi.mocked(ID.unique).mockReturnValue("notification-123");
  });

  it("deve criar uma notificação com sucesso", async () => {
    const mockNotification = {
      sender_id: "user-1",
      receiver_id: "user-2",
      message: "Nova ocorrência",
      type: "alert",
      event_id: "event-1",
      id_device: "device-1",
      title: "Alerta",
      device_options: [],
      location_options: [],
      selected_targets: [],
      is_all_users_checked: false,
    };

    const mockResponse = {
      $id: "notification-123",
      ...mockNotification,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as Response);

    const result = await createNotification(mockNotification as any);

    expect(ID.unique).toHaveBeenCalled();

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/notification-id/documents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          documentId: "notification-123",
          data: {
            sender_id: "user-1",
            receiver_id: "user-2",
            message: "Nova ocorrência",
            is_read: false,
            type: "alert",
            event_id: "event-1",
            id_device: "device-1",
            title: "Alerta",
            device_options: [],
            location_options: [],
            selected_targets: [],
            is_all_users_checked: false,
          },
        }),
      },
    );

    expect(result).toEqual(mockResponse);
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro ao criar notificação"),
    } as Response);

    await expect(
      createNotification({
        sender_id: "user-1",
      } as any),
    ).rejects.toThrow("Error: Erro ao criar notificação");
  });

  it("deve chamar response.json()", async () => {
    const jsonMock = vi.fn().mockResolvedValue({
      $id: "notification-123",
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: jsonMock,
    } as Response);

    await createNotification({
      sender_id: "user-1",
    } as any);

    expect(jsonMock).toHaveBeenCalled();
  });

  it("deve propagar erro de rede", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    await expect(
      createNotification({
        sender_id: "user-1",
      } as any),
    ).rejects.toThrow("Network Error");
  });

  it("deve gerar um ID único para cada criação", async () => {
    vi.mocked(ID.unique).mockReturnValue("unique-id");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as Response);

    await createNotification({
      sender_id: "user-1",
    } as any);

    expect(ID.unique).toHaveBeenCalledTimes(1);
  });
});
