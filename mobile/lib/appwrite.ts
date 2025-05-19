import { Client, Account, Databases, Storage, ID } from 'react-native-appwrite'

export const client = new Client()

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID!)
  // .setKey(process.env.EXPO_PUBLIC_APP_WRITE_KEY!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
// export const users = new Users(client);

export { ID }
