import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getUser } from "./get-user";

describe("getUser", () => {
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

  it("deve retornar usuários encontrados", async () => {
    const mockUsers = [
      {
        $id: "1",
        name: "João",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: mockUsers,
        total: 1,
      }),
    } as unknown as Response);

    const result = await getUser();

    expect(result).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve aplicar filtros informados", async () => {
    const filters = [
      {
        method: "equal",
        attribute: "email",
        values: ["teste@email.com"],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getUser({ filters });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("email");
    expect(url).toContain("teste%40email.com");
    expect(url).toContain("equal");
  });

  it("deve incluir limit e offset quando filtros são informados", async () => {
    const filters = [
      {
        method: "equal",
        attribute: "cpf",
        values: ["123"],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getUser({ filters });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("limit");
    expect(url).toContain("offset");
  });

  it("deve paginar resultados quando total for maior que o limite", async () => {
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

    const result = await getUser();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ $id: "1" }, { $id: "2" }]);
  });

  it("deve retornar array vazio quando não encontrar usuários", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    const result = await getUser();

    expect(result).toEqual([]);
  });

  it("deve interromper execução quando response.ok for false", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    const result = await getUser();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve interromper execução quando fetch lançar exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValue(new Error("Falha de conexão"));

    const result = await getUser();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

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

    await getUser();

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

    await getUser();

    const secondUrl = vi.mocked(fetch).mock.calls[1][0] as string;

    expect(secondUrl).toContain("offset");
    expect(secondUrl).toContain("25");
  });
});
