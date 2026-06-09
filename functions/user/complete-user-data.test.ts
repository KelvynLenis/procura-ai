import { describe, it, expect, vi, beforeEach } from "vitest";
import { completeUserData } from "./complete-user-data";

describe("completeUserData", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_USER = "users-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";

    global.fetch = vi.fn();
  });

  const mockData = {
    birthDate: "1990-01-01",
    cep: "58000-000",
    address: "Rua Teste",
    address_number: "123",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    complement: "Apto 101",
  };

  it("deve atualizar os dados do usuário com sucesso", async () => {
    const mockResponse = {
      $id: "user-doc-1",
      birth_date: "1990-01-01",
      is_first_login: false,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await completeUserData("user-123", mockData);

    expect(result).toEqual(mockResponse);

    expect(fetch).toHaveBeenCalledOnce();
  });

  it("deve enviar os dados corretos para a API", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    await completeUserData("user-123", mockData);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toBe(
      "https://api.test.com/databases/database-id/collections/users-id/documents/user-123",
    );

    expect(options).toMatchObject({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": "project-id",
      },
    });

    expect(JSON.parse(options?.body as string)).toEqual({
      data: {
        birth_date: "1990-01-01",
        cep: "58000-000",
        address: "Rua Teste",
        address_number: "123",
        neighborhood: "Centro",
        city: "João Pessoa",
        state: "PB",
        complement: "Apto 101",
        is_first_login: false,
      },
    });
  });

  it("deve funcionar sem complemento", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    await completeUserData("user-123", {
      ...mockData,
      complement: undefined,
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(JSON.parse(options?.body as string)).toEqual({
      data: {
        birth_date: "1990-01-01",
        cep: "58000-000",
        address: "Rua Teste",
        address_number: "123",
        neighborhood: "Centro",
        city: "João Pessoa",
        state: "PB",
        complement: undefined,
        is_first_login: false,
      },
    });
  });

  it("deve lançar erro quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Erro interno"),
    } as any);

    await expect(completeUserData("user-123", mockData)).rejects.toThrow(
      "Failed to update user status: Erro interno",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve propagar erro de rede", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    await expect(completeUserData("user-123", mockData)).rejects.toThrow(
      "Network Error",
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve marcar is_first_login como false", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as any);

    await completeUserData("user-123", mockData);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options?.body as string);

    expect(body.data.is_first_login).toBe(false);
  });

  it("deve utilizar o endpoint correto", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as any);

    await completeUserData("abc-123", mockData);

    const [url] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain("/databases/database-id");
    expect(url).toContain("/collections/users-id");
    expect(url).toContain("/documents/abc-123");
  });
});
