import { storage } from "@/lib/appwrite";

export async function deleteImage(imageUrl: string) {
  try {
    // Extrair o ID da imagem da URL
    const regex = /\/files\/([^\/]+)\/view/;
    const match = imageUrl.match(regex);
    const imageId = match ? match[1] : null;

    if (!imageId) {
      throw new Error("ID da imagem não encontrado");
    }

    await storage.deleteFile(
      process.env.NEXT_PUBLIC_APP_WRITE_STORAGE_ID!,
      imageId,
    );
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw new Error("Não foi possível deletar a imagem. Tente novamente.");
  }
}
