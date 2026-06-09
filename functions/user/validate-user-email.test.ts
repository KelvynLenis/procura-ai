import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateUserEmail } from "./validate-user-email";

describe("validateUserEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com",
      NEXT_PUBLIC_DATABASE_ID: "database-id",
      NEXT_PUBLIC_COLLECTION_USER: "users-id",
      NEXT_PUBLIC_APP_WRITE_PROJECT_ID: "project-id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve retornar true quando o e-mail não existir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    });

    const result = await validateUserEmail("novo@email.com");

    expect(result).toBe(true);
  });

  it("deve retornar false quando o e-mail já existir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            $id: "user-1",
            email: "teste@email.com",
          },
        ],
      }),
    });

    const result = await validateUserEmail("teste@email.com");

    expect(result).toBe(false);
  });

  it("deve chamar a API com os parâmetros corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    });

    await validateUserEmail("teste@email.com");

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain(
      "https://api.test.com/databases/database-id/collections/users-id/documents?",
    );

    expect(decodeURIComponent(String(url))).toContain('"attribute":"email"');

    expect(decodeURIComponent(String(url))).toContain(
      '"values":["teste@email.com"]',
    );

    expect(options).toEqual({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    await expect(validateUserEmail("teste@email.com")).rejects.toThrow(
      "Erro ao verificar e-mail",
    );
  });

  it("deve relançar erro de rede", async () => {
    const networkError = new Error("Network error");

    global.fetch = vi.fn().mockRejectedValue(networkError);

    await expect(validateUserEmail("teste@email.com")).rejects.toThrow(
      "Network error",
    );
  });

  it("deve considerar apenas e-mails exatamente iguais", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            email: "outro@email.com",
          },
        ],
      }),
    });

    const result = await validateUserEmail("teste@email.com");

    expect(result).toBe(true);
  });
});
