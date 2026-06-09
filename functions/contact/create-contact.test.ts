import { describe, it, expect, vi, beforeEach } from "vitest";
import { createContact } from "./create-contact";
import { getUserId } from "../user/get-user-id";

// Mock do módulo uuid
vi.mock("uuid", () => ({
  v4: () => "fake-uuid",
}));

// Mock do módulo getUserId
vi.mock("../user/get-user-id", () => ({
  getUserId: vi.fn(),
}));

describe("createContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS = "contacts-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve criar um contato com sucesso", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        $id: "contact-123",
      }),
    }) as any;

    const result = await createContact({
      values: {
        contact_name: "João",
        contact_email: "joao@email.com",
        contact_number: "83999999999",
      },
    });

    expect(result).toEqual({
      $id: "contact-123",
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/documents"),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("deve retornar undefined quando a API falhar", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createContact({
      values: {
        contact_name: "João",
        contact_number: "83999999999",
      },
    });

    expect(result).toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve enviar os dados corretos para a API", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await createContact({
      values: {
        contact_name: "João",
        contact_email: "joao@email.com",
        contact_number: "83999999999",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          documentId: "fake-uuid",
          data: {
            name_contact: "João",
            email_contact: "joao@email.com",
            number_contact: "83999999999",
            user_id: "user-123",
          },
        }),
      }),
    );
  });
});
