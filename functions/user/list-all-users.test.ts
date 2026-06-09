import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listAllUsers } from "./list-all-users";

describe("listAllUsers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com",
      NEXT_PUBLIC_DATABASE_ID: "database-id",
      NEXT_PUBLIC_COLLECTION_USER: "users-id",
      NEXT_PUBLIC_APP_WRITE_PROJECT_ID: "project-id",
    };

    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve retornar todos os usuários", async () => {
    const users = [
      {
        $id: "1",
        name: "João",
      },
      {
        $id: "2",
        name: "Maria",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: users,
        total: 2,
      }),
    } as unknown as Response);

    const result = await listAllUsers();

    expect(result).toEqual(users);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve realizar paginação quando houver mais de uma página", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "1" }],
          total: 30,
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "2" }],
          total: 30,
        }),
      } as unknown as Response);

    const result = await listAllUsers();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ $id: "1" }, { $id: "2" }]);
  });

  it("deve utilizar offset na segunda página", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "1" }],
          total: 50,
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          documents: [{ $id: "2" }],
          total: 50,
        }),
      } as unknown as Response);

    await listAllUsers();

    const secondUrl = vi.mocked(fetch).mock.calls[1][0] as string;

    expect(secondUrl).toContain("offset");
    expect(secondUrl).toContain("25");
  });

  it("deve retornar array vazio quando não houver usuários", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    const result = await listAllUsers();

    expect(result).toEqual([]);
  });

  it("deve interromper o loop quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    const result = await listAllUsers();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar usuários:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve interromper o loop quando fetch lançar exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValue(new Error("Falha de conexão"));

    const result = await listAllUsers();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Erro ao buscar usuários:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("deve enviar os headers corretos", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await listAllUsers();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
      }),
    );
  });

  it("deve montar a URL com limit e offset", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await listAllUsers();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("limit");
    expect(url).toContain("offset");
  });
});
