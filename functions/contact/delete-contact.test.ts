// delete-contact.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteContact } from "./delete-contact";

describe("deleteContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS = "contacts-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve deletar um contato com sucesso", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    }) as any;

    await deleteContact("contact-123");

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/contacts-id/documents/contact-123",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      },
    );
  });

  it("deve tratar erro da API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deleteContact("contact-123");

    expect(result).toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
