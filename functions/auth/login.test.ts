// login.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "./login";
import { account } from "@/lib/appwrite";

vi.mock("@/lib/appwrite", () => ({
  account: {
    createEmailPasswordSession: vi.fn(),
    get: vi.fn(),
  },
}));

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_USER = "users-collection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve realizar login e retornar dados do usuário", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
      labels: ["user"],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [
          {
            status: "active",
            is_first_login: false,
          },
        ],
      }),
    }) as any;

    const result = await login("user@email.com", "123456");

    expect(result).toEqual({
      isAdmin: false,
      userId: "user-123",
      userStatus: "active",
      isFirstLogin: false,
    });
  });

  it("deve identificar administrador", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "admin-123",
      labels: ["admin"],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [
          {
            status: "active",
            is_first_login: false,
          },
        ],
      }),
    }) as any;

    const result = await login("admin@email.com", "123456");

    expect(result.isAdmin).toBe(true);
  });

  it("deve criar sessão com email e senha informados", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
      labels: [],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await login("teste@email.com", "senha123");

    expect(account.createEmailPasswordSession).toHaveBeenCalledWith(
      "teste@email.com",
      "senha123",
    );
  });

  it("deve buscar os dados do usuário após criar a sessão", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
      labels: [],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await login("teste@email.com", "123456");

    expect(account.get).toHaveBeenCalledTimes(1);
  });

  it("deve enviar a consulta correta para a coleção de usuários", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
      labels: [],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await login("teste@email.com", "123456");

    const url = vi.mocked(fetch).mock.calls[0][0] as string;

    expect(url).toContain("documents?");
    expect(url).toContain("user_id");
    expect(url).toContain("user-123");
  });

  it("deve enviar os headers corretos para a API", async () => {
    vi.mocked(account.createEmailPasswordSession).mockResolvedValue({} as any);

    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
      labels: [],
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        documents: [],
      }),
    }) as any;

    await login("teste@email.com", "123456");

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });
  });
});
