import { OccurrencesMap } from "@/components/Maps/OccurrencesMap";
import { Device, Event } from "@/utils/types";
import Link from "next/link";
import { TbArrowsMinimize } from "react-icons/tb";


async function fetchStolenDevices() {
  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "isStolen",
      values: [true],
    }),
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch stolen devices: ${error}`);
  }
  return response.json();
}


async function fetchEvents(deviceIds: string[]): Promise<Event[]> {
  let allEvents: Event[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "is_alert_on",
        values: [true],
      }),
      "queries[1]": JSON.stringify({
        method: "contains",
        attribute: "id_device",
        values: deviceIds,
      }),
      "queries[2]": JSON.stringify({
        method: "limit",
        values: [limit],
      }),
      "queries[3]": JSON.stringify({
        method: "offset",
        values: [offset],
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
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch stolen devices: ${error}`);
    }

    const data = await response.json();
    allEvents = allEvents.concat(data.documents);

    if (data.documents.length < limit) {
      break; // Não há mais eventos para buscar
    }

    offset += limit;
  }

  return allEvents;
}

async function fetchOwnerInfo(auth_id: string) {

  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "userId",
      values: [auth_id],
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
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user info: ${error}`);
  }

  return response.json();
}


async function getDashboardData() {
  try {
    const devicesData = await fetchStolenDevices();
    const devices: Device[] = devicesData.documents;

    if (devices.length === 0) return []; // Nenhum dispositivo roubado encontrado

    const deviceIds = devices.map((device) => device.$id);
    const events = await fetchEvents(deviceIds);
    
    const enrichedDevices = await Promise.all(
      devices.map(async (device) => {
        const recentEvent = events
          .filter((event) => event.id_device === device.$id)
          .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];

        const ownerResponse = await fetchOwnerInfo(device.auth_id!);
        const ownerInfo = ownerResponse?.documents?.[0];

        return {
          device: { ...device },
          event: recentEvent,
          user: {
            name: ownerInfo?.name || "N/A",
            email: ownerInfo?.email || "N/A",
          },
        };
      })
    );

    return enrichedDevices;
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    throw error;
  }
}


export default async function Dashboard() {

  let occurencesData;

  try {
    const dashboardData = await getDashboardData();
    console.log(dashboardData);

    occurencesData = dashboardData
  } catch (error) {
    console.log(error)
  }

  return (
    <div className="flex flex-col">
      <OccurrencesMap occurences={occurencesData} />
      <Link href={'/dashboard'}>
        <TbArrowsMinimize size={38} className="absolute top-4 right-5 z-10 hover:animate-pulse bg-white rounded-xl p-1 shadow" />
      </Link>
    </div>
  )
}