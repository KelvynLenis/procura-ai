import { storage } from "@/lib/appwrite";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File) {
  try {
    const fileCreated = await storage.createFile(
      process.env.NEXT_PUBLIC_APP_WRITE_STORAGE_ID!,
      uuidv4(),
      file,
    );

    const fileCreatedId = fileCreated.$id;

    const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APP_WRITE_STORAGE_ID}/files/${fileCreatedId}/view?project=${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}&mode=admin`;

    return url;
  } catch (error) {
    console.error(error);
  }
}
