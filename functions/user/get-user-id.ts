import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_USER = process.env.NEXT_PUBLIC_COLLECTION_USER!;

export async function getUserId() {
  const { $id: userId } = await account.get();

  return userId;
}

export async function getUserDocumentId(): Promise<string | null> {
  const accountId = await getUserId();

  const users = await databases.listDocuments(DATABASE_ID, COLLECTION_USER, [
    Query.equal("user_id", accountId),
  ]);

  if (users.documents.length === 0) {
    return null;
  }

  return users.documents[0].$id;
}
