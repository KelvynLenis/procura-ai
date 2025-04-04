import { account } from '@/lib/appwrite'

export async function updatePassword(password: string) {
  await account.updatePassword(password)
}
