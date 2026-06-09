import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOperator } from "./get-operator";

global.fetch = vi.fn();

describe("getOperator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_API_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_DATABASE_ID = "database-id";
    process.env.NEXT_PUBLIC_COLLECTION_OPERATORS = "operators-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
  });

  it("deve retornar undefined quando operatorId não for informado", async () => {
    const result = await getOperator(undefined);

    expect(result).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deve retornar operador quando a requisição for bem sucedida", async () => {
    const mockOperator = {
      $id: "operator-1",
      name: "Vivo",
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockOperator),
    } as any);

    const result = await getOperator("operator-1");

    expect(result).toEqual(mockOperator);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/operators-id/documents/operator-1",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        },
        cache: "no-store",
      },
    );
  });

  it("deve retornar undefined quando a API retornar erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue("Operator not found"),
    } as any);

    const result = await getOperator("operator-1");

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve retornar undefined quando fetch lançar exceção", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"));

    const result = await getOperator("operator-1");

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve utilizar o id informado na URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as any);

    await getOperator("custom-id");

    const [url] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain("/documents/custom-id");
  });
});
