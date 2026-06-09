import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getUserInfo } from "./get-user-info";

describe("getUserInfo", () => {
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

  it("deve retornar os usuários encontrados", async () => {
    const mockUsers = [
      {
        $id: "1",
        user_id: "auth-123",
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

    const result = await getUserInfo("auth-123");

    expect(result).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve montar a query utilizando o auth_id informado", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
        total: 0,
      }),
    } as unknown as Response);

    await getUserInfo("user-abc");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("user_id");
    expect(url).toContain("user-abc");
    expect(url).toContain("equal");
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

    const result = await getUserInfo("auth-123");

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

    const result = await getUserInfo("auth-123");

    expect(result).toEqual([]);
  });

  it("deve interromper o loop e retornar vazio quando a API falhar", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as unknown as Response);

    const result = await getUserInfo("auth-123");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve interromper o loop quando fetch lançar exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValue(new Error("Falha de conexão"));

    const result = await getUserInfo("auth-123");

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

    await getUserInfo("auth-123");

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
});
