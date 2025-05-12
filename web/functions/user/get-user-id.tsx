import { account } from '@/lib/appwrite'

export async function getUserId() {
  const { $id: userId } = await account.get()

  return userId
}
