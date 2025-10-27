import { Device } from "@/types";

export async function listStolenDevices() {
  const allDevices: Device[] = [];
  let offset = 0;
  const limit = 25;
  let total = Infinity;

  while (offset < total) {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "is_stolen",
        values: [true],
      }),
      "queries[1]": JSON.stringify({
        method: "limit",
        values: [limit],
      }),
      "queries[2]": JSON.stringify({
        method: "offset",
        values: [offset],
      }),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
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
        throw new Error(
          `Failed to fetch stolen devices: ${await response.text()}`,
        );
      }

      const { documents, total: fetchedTotal } = await response.json();

      allDevices.push(...documents);
      total = fetchedTotal;
      offset += limit;
    } catch (error) {
      console.error(error);
      break;
    }
  }
  return allDevices;
}
