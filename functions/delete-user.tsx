import * as sdk from 'node-appwrite'

const client = new sdk.Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PUBLIC_APP_WRITE_API_KEY!)

const users = new sdk.Users(client)

export async function deleteUser(userId: string) {
  const session = await users.deleteSessions(userId)

  console.log(session)

  const result = await users.delete(userId)
}

export async function deleteUserSession(userId: string) {
  const result = await users.deleteSessions(userId)
  console.log(result)
}
