import { Client, Account, Databases, Functions } from 'appwrite';

export const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export { ID } from 'appwrite';
