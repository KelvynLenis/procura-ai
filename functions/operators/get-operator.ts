import type { Operator } from "@/types";

export async function getOperator(
  operatorId: string | undefined,
): Promise<Operator | undefined> {
  if (!operatorId) {
    return undefined;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_OPERATORS}/documents/${operatorId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch districts: ${await response.text()}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
