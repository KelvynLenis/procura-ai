import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteContactByUserId } from "./delete-contact-by-user-id";

describe("deleteContactByUserId", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);

    process.env.NEXT_PUBLIC_API_URL = "https://appwrite.test/v1";
    process.env.NEXT_PUBLIC_DATABASE_ID = "databaseId";
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS = "contactsCollection";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "projectId";
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("should return true when no contacts are found", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        documents: [],
      }),
    });

    const result = await deleteContactByUserId("user-123");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/documents?"),
      expect.objectContaining({
        headers: {
          "X-Appwrite-Project": "projectId",
        },
      }),
    );
  });

  it("should delete a single contact", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          documents: [{ $id: "doc-1" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const result = await deleteContactByUserId("user-123");

    expect(result).toBe(true);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://appwrite.test/v1/databases/databaseId/collections/contactsCollection/documents/doc-1",
      {
        method: "DELETE",
        headers: {
          "X-Appwrite-Project": "projectId",
        },
      },
    );
  });

  it("should delete multiple contacts", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          documents: [{ $id: "doc-1" }, { $id: "doc-2" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    const result = await deleteContactByUserId("user-123");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://appwrite.test/v1/databases/databaseId/collections/contactsCollection/documents/doc-1",
      expect.any(Object),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://appwrite.test/v1/databases/databaseId/collections/contactsCollection/documents/doc-2",
      expect.any(Object),
    );
  });

  it("should return false when delete request fails", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          documents: [{ $id: "doc-1" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const result = await deleteContactByUserId("user-123");

    expect(result).toBe(false);
  });

  it("should return false when find request throws an error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    const result = await deleteContactByUserId("user-123");

    expect(result).toBe(false);
  });
});
