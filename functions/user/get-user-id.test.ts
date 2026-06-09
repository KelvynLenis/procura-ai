import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserId } from "./get-user-id";
import { account } from "@/lib/appwrite";

vi.mock("@/lib/appwrite", () => ({
  account: {
    get: vi.fn(),
  },
}));

describe("getUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar o id do usuário autenticado", async () => {
    vi.mocked(account.get).mockResolvedValue({
      $id: "user-123",
    } as never);

    const result = await getUserId();

    expect(account.get).toHaveBeenCalledOnce();
    expect(result).toBe("user-123");
  });

  it("deve propagar erro caso account.get falhe", async () => {
    const error = new Error("Falha ao obter usuário");

    vi.mocked(account.get).mockRejectedValue(error);

    await expect(getUserId()).rejects.toThrow("Falha ao obter usuário");

    expect(account.get).toHaveBeenCalledOnce();
  });
});
