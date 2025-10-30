import { account } from "@/lib/appwrite";

export async function updatePassword(password: string, oldPassword: string) {
  await account.updatePassword(password, oldPassword);
}
