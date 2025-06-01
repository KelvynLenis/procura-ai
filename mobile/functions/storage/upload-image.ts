import { storage } from '@/lib/appwrite'
import { v4 as uuidv4 } from 'uuid'

interface FileData {
  name: string;
  type: string;
  size: number;
  uri: string;
}

export async function uploadImage(file: FileData) {
  try {
    // Verificar conexão antes de tentar o upload
    const response = await fetch(file.uri);
    if (!response.ok) {
      throw new Error('Falha ao acessar a imagem');
    }

    const blob = await response.blob();
    if (!blob) {
      throw new Error('Falha ao processar a imagem');
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    const fileCreated = await storage.createFile(
      process.env.EXPO_PUBLIC_APP_WRITE_STORAGE_ID!,
      uuidv4(),
      {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri
      }
    )

    if (!fileCreated || !fileCreated.$id) {
      throw new Error('Falha ao criar arquivo no servidor');
    }

    const fileCreatedId = fileCreated.$id

    const url = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.EXPO_PUBLIC_APP_WRITE_STORAGE_ID}/files/${fileCreatedId}/view?project=${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}&mode=admin`

    return url
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    
    // Melhorar mensagens de erro
    if (error.message?.includes('Network request failed')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    
    if (error.message?.includes('5MB')) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    throw new Error('Não foi possível fazer o upload da imagem. Tente novamente.');
  }
}
