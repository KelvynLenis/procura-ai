import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/appwrite", () => ({
  account: {
    get: vi.fn(),
  },
}));

import { account } from "@/lib/appwrite";
import { checkUserStatus } from "./check-user-status";

describe("checkUserStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_USER = "users-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  it("deve retornar status do usuário e isAdmin=true para administrador", async () => {
    vi.mocked(account.get).mockResolvedValue({
      labels: ["admin"],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            status: "Ativo",
          },
        ],
      }),
    } as any);

    const result = await checkUserStatus("user-123");

    expect(result).toEqual({
      status: "Ativo",
      isAdmin: true,
    });

    expect(account.get).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("deve retornar isAdmin=false para usuário comum", async () => {
    vi.mocked(account.get).mockResolvedValue({
      labels: ["user"],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            status: "Pendente",
          },
        ],
      }),
    } as any);

    const result = await checkUserStatus("user-123");

    expect(result).toEqual({
      status: "Pendente",
      isAdmin: false,
    });
  });

  it("deve retornar isAdmin=false quando labels estiver vazio", async () => {
    vi.mocked(account.get).mockResolvedValue({
      labels: [],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            status: "Ativo",
          },
        ],
      }),
    } as any);

    const result = await checkUserStatus("user-123");

    expect(result.isAdmin).toBe(false);
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(account.get).mockResolvedValue({
      labels: ["admin"],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as any);

    await expect(checkUserStatus("user-123")).rejects.toThrow(
      "Erro ao verificar status do usuário",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve lançar erro quando usuário não for encontrado", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(account.get).mockResolvedValue({
      labels: ["admin"],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    } as any);

    await expect(checkUserStatus("user-123")).rejects.toThrow(
      "Usuário não encontrado",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve propagar erro do account.get()", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(account.get).mockRejectedValue(new Error("Erro de autenticação"));

    await expect(checkUserStatus("user-123")).rejects.toThrow(
      "Erro de autenticação",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve propagar erro do fetch()", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(account.get).mockResolvedValue({
      labels: ["admin"],
    } as any);

    vi.mocked(fetch).mockRejectedValue(new Error("Erro de conexão"));

    await expect(checkUserStatus("user-123")).rejects.toThrow(
      "Erro de conexão",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve montar a URL corretamente", async () => {
    vi.mocked(account.get).mockResolvedValue({
      labels: ["admin"],
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            status: "Ativo",
          },
        ],
      }),
    } as any);

    await checkUserStatus("user-123");

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain("/databases/database-id");
    expect(url).toContain("/collections/users-id");
    expect(url).toContain("user_id");

    expect(options).toMatchObject({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });
  });
});
