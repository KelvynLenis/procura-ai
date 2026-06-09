import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateUserCpf } from "./validate-user-cpf";

describe("validateUserCpf", () => {
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

  it("deve retornar true quando CPF não existir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    });

    const result = await validateUserCpf("12345678900");

    expect(result).toBe(true);
  });

  it("deve retornar false quando CPF já existir", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            $id: "user-1",
            cpf: "12345678900",
          },
        ],
      }),
    });

    const result = await validateUserCpf("12345678900");

    expect(result).toBe(false);
  });

  it("deve chamar a API com os parâmetros corretos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [],
      }),
    });

    await validateUserCpf("12345678900");

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain(
      "https://api.test.com/databases/database-id/collections/users-id/documents?",
    );

    expect(decodeURIComponent(String(url))).toContain('"attribute":"cpf"');

    expect(decodeURIComponent(String(url))).toContain(
      '"values":["12345678900"]',
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

    await expect(validateUserCpf("12345678900")).rejects.toThrow(
      "Erro ao verificar CPF",
    );
  });

  it("deve relançar erro de rede", async () => {
    const networkError = new Error("Network error");

    global.fetch = vi.fn().mockRejectedValue(networkError);

    await expect(validateUserCpf("12345678900")).rejects.toThrow(
      "Network error",
    );
  });

  it("deve considerar apenas CPFs exatamente iguais", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        documents: [
          {
            cpf: "99999999999",
          },
        ],
      }),
    });

    const result = await validateUserCpf("12345678900");

    expect(result).toBe(true);
  });
});
