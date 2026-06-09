import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockDeleteSessions, mockDelete } = vi.hoisted(() => ({
  mockDeleteSessions: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("node-appwrite", () => {
  class Client {
    setEndpoint() {
      return this;
    }

    setProject() {
      return this;
    }

    setKey() {
      return this;
    }
  }

  class Users {
    deleteSessions = mockDeleteSessions;
    delete = mockDelete;

    constructor() {}
  }

  return {
    Client,
    Users,
  };
});

import { deleteUser, deleteUserSession } from "./delete-user";

describe("deleteUser", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDeleteSessions.mockReset();
    mockDelete.mockReset();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: "https://api.test.com",
      NEXT_PUBLIC_DATABASE_ID: "database-id",
      NEXT_PUBLIC_COLLECTION_USER: "users-id",
      NEXT_PUBLIC_APP_WRITE_PROJECT_ID: "project-id",
      NEXT_PUBLIC_APP_WRITE_API_KEY: "api-key",
    };

    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve deletar sessões, usuário e documento com sucesso", async () => {
    mockDeleteSessions.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: vi.fn(),
    } as unknown as Response);

    const result = await deleteUser("auth-user-id", "document-user-id");

    expect(mockDeleteSessions).toHaveBeenCalledWith("auth-user-id");
    expect(mockDelete).toHaveBeenCalledWith("auth-user-id");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/databases/database-id/collections/users-id/documents/document-user-id",
      expect.objectContaining({
        method: "DELETE",
      }),
    );

    expect(result).toBe(true);
  });

  it("deve lançar erro quando deleteSessions falhar", async () => {
    const error = new Error("Erro ao deletar sessões");

    mockDeleteSessions.mockRejectedValue(error);

    await expect(
      deleteUser("auth-user-id", "document-user-id"),
    ).rejects.toThrow("Erro ao deletar sessões");

    expect(mockDelete).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando delete falhar", async () => {
    const error = new Error("Erro ao deletar usuário");

    mockDeleteSessions.mockResolvedValue(undefined);
    mockDelete.mockRejectedValue(error);

    await expect(
      deleteUser("auth-user-id", "document-user-id"),
    ).rejects.toThrow("Erro ao deletar usuário");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando a exclusão do documento falhar", async () => {
    mockDeleteSessions.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Documento não encontrado"),
    } as unknown as Response);

    await expect(
      deleteUser("auth-user-id", "document-user-id"),
    ).rejects.toThrow(
      "Erro ao deletar documento do usuário: Documento não encontrado",
    );

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve enviar o header X-Appwrite-Project corretamente", async () => {
    mockDeleteSessions.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: vi.fn(),
    } as unknown as Response);

    await deleteUser("auth-user-id", "document-user-id");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Appwrite-Project": "project-id",
        }),
      }),
    );
  });
});

describe("deleteUserSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDeleteSessions.mockReset();
    mockDelete.mockReset();
  });

  it("deve deletar as sessões do usuário", async () => {
    const mockResult = { success: true };

    mockDeleteSessions.mockResolvedValue(mockResult);

    const result = await deleteUserSession("user-id");

    expect(mockDeleteSessions).toHaveBeenCalledWith("user-id");
    expect(result).toEqual(mockResult);
  });

  it("deve propagar erro quando deleteSessions falhar", async () => {
    const error = new Error("Erro ao remover sessões");

    mockDeleteSessions.mockRejectedValue(error);

    await expect(deleteUserSession("user-id")).rejects.toThrow(
      "Erro ao remover sessões",
    );
  });
});
