import type { Event } from "@/types";

export async function getEventById(id: string): Promise<Event> {
  try {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "$id",
        values: [id],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${await response.text()}`);
    }

    const { documents } = await response.json();

    console.log("Detalhes do alerta:", documents);

    return documents[0];
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch events: ${error}`);
  }
}
