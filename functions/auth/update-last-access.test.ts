// update-last-access.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateLastAccess } from "./update-last-access";

describe("updateLastAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_USER = "users-collection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve atualizar a data de último acesso", async () => {
    const mockedDate = "2026-01-01T10:00:00.000Z";

    vi.spyOn(Date.prototype, "toISOString").mockReturnValue(mockedDate);

    global.fetch = vi.fn().mockResolvedValue({}) as any;

    await updateLastAccess("document-123");

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/users-collection/documents/document-123",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data: {
            accessed_at: mockedDate,
          },
        }),
      },
    );
  });

  it("deve enviar a data no formato ISO", async () => {
    const mockedDate = "2026-05-10T12:30:45.123Z";

    vi.spyOn(Date.prototype, "toISOString").mockReturnValue(mockedDate);

    global.fetch = vi.fn().mockResolvedValue({}) as any;

    await updateLastAccess("document-123");

    const fetchOptions = vi.mocked(fetch).mock.calls[0][1];

    expect(fetchOptions).toMatchObject({
      body: JSON.stringify({
        data: {
          accessed_at: mockedDate,
        },
      }),
    });
  });

  it("deve propagar erro caso o fetch falhe", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error")) as any;

    await expect(updateLastAccess("document-123")).rejects.toThrow(
      "Network Error",
    );
  });
});
