import { account } from "@/lib/appwrite";

interface LoginResponse {
  isAdmin: boolean;
  userId: string;
  userStatus?: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  await account.createEmailPasswordSession(email, password);
  const user = await account.get();

  const isAdmin = user.labels[0] === "admin";

  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "user_id",
      values: [`${user.$id}`],
    }),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
    },
  );

  const {
    documents: [userDoc],
  } = await response.json();

  return {
    isAdmin,
    userId: user.$id,
    userStatus: userDoc?.status,
  };
}
