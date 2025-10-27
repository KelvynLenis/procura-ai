import { Device } from "@/types";

interface ListDevicesByStatusParams {
  status: string;
  userId?: string;
  isAdmin?: boolean;
}

export async function listDevicesByStatus({
  status,
  userId,
  isAdmin,
}: ListDevicesByStatusParams): Promise<Device[]> {
  const allDevices: Device[] = [];
  let offset = 0;
  const limit = 25;
  let total = Infinity;

  while (offset < total) {
    const queries = [
      {
        method: "equal",
        attribute: "status",
        values: [status],
      },
    ];

    if (!isAdmin && userId) {
      queries.push({
        method: "equal",
        attribute: "auth_id",
        values: [userId],
      });
    }

    queries.push(
      {
        method: "limit",
        attribute: "limit",
        values: [`${limit}`],
      },
      {
        method: "offset",
        attribute: "offset",
        values: [`${offset}`],
      },
    );

    const params = new URLSearchParams();
    queries.forEach((query, index) => {
      params.append(`queries[${index}]`, JSON.stringify(query));
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
        throw new Error(`Failed to fetch devices: ${await response.text()}`);
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
