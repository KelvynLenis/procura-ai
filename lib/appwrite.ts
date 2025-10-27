import { Client, Account, Databases, Functions, Storage } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!);
// .setKey(process.env.NEXT_PUBLIC_APP_WRITE_KEY!)

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export const storage = new Storage(client);
// export const users = new Users(client);

export { ID } from "appwrite";
