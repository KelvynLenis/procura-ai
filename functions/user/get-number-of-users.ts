import type { QueryFilter, User } from "@/types";

export async function getNumberOfUsers(): Promise<number> {
  const allUsers = [];

  let offset = 0;
  const limit = 25;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const params = new URLSearchParams();
    params.append(
      `queries[0]`,
      JSON.stringify({
        method: "limit",
        values: [limit],
      }),
    );

    params.append(
      `queries[1]`,
      JSON.stringify({
        method: "offset",
        values: [offset],
      }),
    );

    params.append(
      `queries[2]`,
      JSON.stringify({
        method: "equal",
        attribute: "type",
        values: ["Usuario"],
      }),
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
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
        const error = await response.text();
        throw new Error(`Failed to fetch user info: ${error}`);
      }
      const { documents, total: fetchedTotal } = await response.json();
      allUsers.push(...documents);
      total = fetchedTotal;
      offset += limit;
    } catch (error) {
      console.error(error);
      break;
    }
  }
  return total;
}
