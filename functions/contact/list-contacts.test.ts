// list-contacts.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { listContacts } from "./list-contacts";
import { getUserId } from "../user/get-user-id";

vi.mock("../user/get-user-id", () => ({
  getUserId: vi.fn(),
}));

describe("listContacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS = "contacts-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve listar contatos usando userIdParam", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          {
            $id: "1",
            name_contact: "João",
            number_contact: "83999999999",
          },
        ],
      }),
    }) as any;

    const result = await listContacts({
      userIdParam: "user-123",
    });

    expect(result).toEqual([
      {
        $id: "1",
        name_contact: "João",
        number_contact: "83999999999",
      },
    ]);

    expect(getUserId).not.toHaveBeenCalled();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve obter o userId através de getUserId quando userIdParam não for informado", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-456");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await listContacts({});

    expect(getUserId).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve enviar o filtro user_id na URL", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await listContacts({
      userIdParam: "user-123",
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("documents?");
    expect(url).toContain("queries");
    expect(url).toContain("user_id");
    expect(url).toContain("user-123");
  });

  it("deve realizar a requisição GET corretamente", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await listContacts({
      userIdParam: "user-123",
    });

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
      next: {
        tags: ["contacts"],
      },
    });
  });

  it("deve tratar erro da API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Unauthorized",
    }) as any;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await listContacts({
      userIdParam: "user-123",
    });

    expect(result).toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
