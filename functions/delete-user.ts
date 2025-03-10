import * as sdk from 'node-appwrite'

const client = new sdk.Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PUBLIC_APP_WRITE_API_KEY!)

const users = new sdk.Users(client)

export async function deleteUser(userId: string) {
  const result = await users.delete(userId)
}
