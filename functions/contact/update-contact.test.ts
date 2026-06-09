import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateContact } from "./update-contact";

describe("updateContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS = "contacts-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve atualizar um contato com sucesso", async () => {
    const mockResponse = {
      $id: "contact-123",
      name_contact: "João Atualizado",
      email_contact: "joao@email.com",
      number_contact: "83999999999",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }) as any;

    const result = await updateContact({
      id: "contact-123",
      values: {
        contact_name: "João Atualizado",
        contact_email: "joao@email.com",
        contact_number: "83999999999",
      },
    });

    expect(result).toEqual(mockResponse);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve enviar os dados corretos para a API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    await updateContact({
      id: "contact-123",
      values: {
        contact_name: "João Atualizado",
        contact_email: "joao@email.com",
        contact_number: "83999999999",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/contacts-id/documents/contact-123",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        body: JSON.stringify({
          data: {
            name_contact: "João Atualizado",
            email_contact: "joao@email.com",
            number_contact: "83999999999",
          },
        }),
        next: {
          tags: ["contacts"],
        },
      },
    );
  });

  it("deve tratar erro da API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await updateContact({
      id: "contact-123",
      values: {
        contact_name: "João",
        contact_email: "joao@email.com",
        contact_number: "83999999999",
      },
    });

    expect(result).toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error in createContact:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
