import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fetchMock = vi.fn();

Object.defineProperty(global, "fetch", {
  value: fetchMock,
  writable: true,
});

describe("verification-store", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.APPWRITE_API_URL = "https://appwrite.test";
    process.env.APPWRITE_PROJECT_ID = "project-id";
    process.env.APPWRITE_API_KEY = "api-key";
    process.env.APPWRITE_DATABASE_ID = "database-id";
    process.env.APPWRITE_COLLECTION_VERIFICATION_CODES = "verification-id";
    process.env.APPWRITE_COLLECTION_USER = "users-id";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCodeByEmail", () => {
    it("deve retornar o documento encontrado", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [
            {
              $id: "doc-1",
              email: "user@test.com",
            },
          ],
        }),
      });

      const { getCodeByEmail } = await import("./verification-store");

      const result = await getCodeByEmail("user@test.com");

      expect(result).toEqual(
        expect.objectContaining({
          $id: "doc-1",
        }),
      );
    });

    it("deve retornar null quando não encontrar documento", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      const { getCodeByEmail } = await import("./verification-store");

      const result = await getCodeByEmail("user@test.com");

      expect(result).toBeNull();
    });
  });

  describe("incrementAttempts", () => {
    it("deve atualizar tentativas", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      const { incrementAttempts } = await import("./verification-store");

      await incrementAttempts("doc-1", 3);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/doc-1"),
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });
  });

  describe("deleteCode", () => {
    it("deve remover documento com sucesso", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { deleteCode } = await import("./verification-store");

      await expect(deleteCode("doc-1")).resolves.toBeUndefined();
    });

    it("deve ignorar erro 404", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { deleteCode } = await import("./verification-store");

      await expect(deleteCode("doc-1")).resolves.toBeUndefined();
    });

    it("deve lançar erro para outros status", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "erro",
      });

      const { deleteCode } = await import("./verification-store");

      await expect(deleteCode("doc-1")).rejects.toThrow("erro");
    });
  });

  describe("deleteCodeByEmail", () => {
    it("deve remover todos os códigos encontrados", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [{ $id: "1" }, { $id: "2" }],
          }),
        })
        .mockResolvedValue({
          ok: true,
          status: 204,
        });

      const { deleteCodeByEmail } = await import("./verification-store");

      await deleteCodeByEmail("user@test.com");

      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("não deve falhar quando não houver documentos", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      const { deleteCodeByEmail } = await import("./verification-store");

      await expect(deleteCodeByEmail("user@test.com")).resolves.toBeUndefined();
    });
  });

  describe("saveCode", () => {
    it("deve salvar código com sucesso", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            $id: "new-doc",
          }),
        });

      const { saveCode } = await import("./verification-store");

      const result = await saveCode({
        email: "user@test.com",
        hashedCode: "hash",
        expiresAt: "2025-01-01",
        userId: "user-1",
        userName: "João",
      });

      expect(result).toEqual(
        expect.objectContaining({
          $id: "new-doc",
        }),
      );
    });

    it("deve tentar payload alternativo em erro de estrutura", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          text: async () => "Invalid document structure",
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            $id: "new-doc",
          }),
        });

      const { saveCode } = await import("./verification-store");

      const result = await saveCode({
        email: "user@test.com",
        hashedCode: "hash",
        expiresAt: "2025-01-01",
        userId: "user-1",
      });

      expect(result.$id).toBe("new-doc");
    });

    it("deve lançar erro para falha não relacionada à estrutura", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          text: async () => "Unauthorized",
        });

      const { saveCode } = await import("./verification-store");

      await expect(
        saveCode({
          email: "user@test.com",
          hashedCode: "hash",
          expiresAt: "2025-01-01",
          userId: "user-1",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateUserStatusByAuthId", () => {
    it("deve atualizar status do usuário", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            documents: [{ $id: "doc-user" }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
          }),
        });

      const { updateUserStatusByAuthId } = await import("./verification-store");

      await updateUserStatusByAuthId("auth-id", "Limitado");

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("deve lançar erro quando usuário não existir", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documents: [],
        }),
      });

      const { updateUserStatusByAuthId } = await import("./verification-store");

      await expect(
        updateUserStatusByAuthId("auth-id", "Limitado"),
      ).rejects.toThrow("Usuario nao encontrado para atualizar status");
    });
  });

  describe("createSessionTokenByAuthUserId", () => {
    it("deve criar token de sessão", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secret: "token-secret",
        }),
      });

      const { createSessionTokenByAuthUserId } = await import(
        "./verification-store"
      );

      const result = await createSessionTokenByAuthUserId("user-1");

      expect(result).toEqual({
        secret: "token-secret",
      });
    });

    it("deve lançar erro quando API_KEY estiver ausente", async () => {
      const originalKey = process.env.APPWRITE_API_KEY;
      delete process.env.APPWRITE_API_KEY;

      vi.resetModules();

      const module = await import("./verification-store");

      await expect(
        module.createSessionTokenByAuthUserId("user-1"),
      ).rejects.toThrow("APPWRITE_API_KEY obrigatoria para criar sessao");

      process.env.APPWRITE_API_KEY = originalKey;
    });
  });
});
