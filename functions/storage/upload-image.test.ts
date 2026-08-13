import { File as NodeFile } from "node:buffer";
import { describe, it, expect, vi, beforeEach } from "vitest";

if (typeof globalThis.File === "undefined") {
  globalThis.File = NodeFile as unknown as typeof globalThis.File;
}

vi.mock("@/lib/appwrite", () => ({
  storage: {
    createFile: vi.fn(),
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid"),
}));

import { storage } from "@/lib/appwrite";
import { uploadImage } from "./upload-image";

describe("uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_APP_WRITE_STORAGE_ID = "storage-id";
    process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID = "project-id";
    process.env.NEXT_PUBLIC_API_URL = "https://fra.cloud.appwrite.io/v1";
  });

  it("deve fazer upload da imagem e retornar a URL", async () => {
    const mockFile = new File(["conteudo"], "foto.jpg", {
      type: "image/jpeg",
    });

    vi.mocked(storage.createFile).mockResolvedValue({
      $id: "file-123",
    } as any);

    const result = await uploadImage(mockFile);

    expect(storage.createFile).toHaveBeenCalledWith(
      "storage-id",
      "mock-uuid",
      mockFile,
    );

    expect(result).toBe(
      "https://fra.cloud.appwrite.io/v1/storage/buckets/storage-id/files/file-123/view?project=project-id&mode=admin",
    );
  });

  it("deve retornar undefined quando ocorrer erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockFile = new File(["conteudo"], "foto.jpg", {
      type: "image/jpeg",
    });

    vi.mocked(storage.createFile).mockRejectedValue(new Error("Upload falhou"));

    const result = await uploadImage(mockFile);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve usar o id retornado pelo Appwrite para montar a URL", async () => {
    const mockFile = new File(["conteudo"], "foto.jpg", {
      type: "image/jpeg",
    });

    vi.mocked(storage.createFile).mockResolvedValue({
      $id: "custom-file-id",
    } as any);

    const result = await uploadImage(mockFile);

    expect(result).toContain("/files/custom-file-id/view");
  });
});
