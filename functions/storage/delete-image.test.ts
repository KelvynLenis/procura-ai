import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteImage } from "./delete-image";
import { storage } from "@/lib/appwrite";

vi.mock("@/lib/appwrite", () => ({
  storage: {
    deleteFile: vi.fn(),
  },
}));

describe("deleteImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_APP_WRITE_STORAGE_ID = "bucket-id";
  });

  it("deve deletar a imagem quando a URL for válida", async () => {
    const imageUrl =
      "https://cloud.appwrite.io/v1/storage/buckets/bucket/files/image-123/view";

    vi.mocked(storage.deleteFile).mockResolvedValue(undefined);

    await deleteImage(imageUrl);

    expect(storage.deleteFile).toHaveBeenCalledWith("bucket-id", "image-123");
  });

  it("deve extrair corretamente o imageId da URL", async () => {
    const imageUrl = "https://meuservidor.com/storage/files/abc-456/view";

    vi.mocked(storage.deleteFile).mockResolvedValue(undefined);

    await deleteImage(imageUrl);

    expect(storage.deleteFile).toHaveBeenCalledWith("bucket-id", "abc-456");
  });

  it("deve lançar erro quando não conseguir extrair o ID da imagem", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const invalidUrl = "https://cloud.appwrite.io/imagem-invalida";

    await expect(deleteImage(invalidUrl)).rejects.toThrow(
      "Não foi possível deletar a imagem. Tente novamente.",
    );

    expect(storage.deleteFile).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("deve lançar erro quando deleteFile falhar", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const imageUrl =
      "https://cloud.appwrite.io/v1/storage/buckets/bucket/files/image-123/view";

    vi.mocked(storage.deleteFile).mockRejectedValue(new Error("Storage Error"));

    await expect(deleteImage(imageUrl)).rejects.toThrow(
      "Não foi possível deletar a imagem. Tente novamente.",
    );

    expect(storage.deleteFile).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it("deve chamar console.error quando ocorrer erro", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(storage.deleteFile).mockRejectedValue(new Error("Storage Error"));

    const imageUrl =
      "https://cloud.appwrite.io/v1/storage/buckets/bucket/files/image-123/view";

    await expect(deleteImage(imageUrl)).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
