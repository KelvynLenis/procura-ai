import { v4 as uuidv4 } from "uuid";

interface CreateEventData {
  id_device: string;
  time_event: string;
  description?: string;
  retrieval_location?: string;
  address?: string;
  admin_id?: string;
  type: string;
  is_alert_on: boolean;
  last_location: [number, number];
  id_district: string;
}

export async function createEvent(data: CreateEventData) {
  const eventId = uuidv4();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          documentId: eventId,
          data,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${await response.text()}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
