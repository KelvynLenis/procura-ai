// update-password.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { updatePassword } from "./update-password";
import { account } from "@/lib/appwrite";

vi.mock("@/lib/appwrite", () => ({
  account: {
    updatePassword: vi.fn(),
  },
}));

describe("updatePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve atualizar a senha com os parâmetros informados", async () => {
    vi.mocked(account.updatePassword)
      .mockResolvedValue({} as any);

    await updatePassword(
      "NovaSenha@123",
      "SenhaAtual@123"
    );

    expect(account.updatePassword)
      .toHaveBeenCalledTimes(1);

    expect(account.updatePassword)
      .toHaveBeenCalledWith(
        "NovaSenha@123",
        "SenhaAtual@123"
      );
  });

  it("deve propagar erro do Appwrite", async () => {
    vi.mocked(account.updatePassword)
      .mockRejectedValue(
        new Error("Senha atual inválida")
      );

    await expect(
      updatePassword(
        "NovaSenha@123",
        "senha-errada"
      )
    ).rejects.toThrow(
      "Senha atual inválida"
    );
  });
});