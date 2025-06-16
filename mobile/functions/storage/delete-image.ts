
import { storage } from '@/lib/appwrite';

export async function deleteImage(fileId: string) {
    try {
        const result = await storage.deleteFile(
            process.env.EXPO_PUBLIC_APP_WRITE_STORAGE_ID!, // bucketId
            fileId // fileId
        );
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        throw new Error('Não foi possível deletar a imagem. Tente novamente.');
    }
}
