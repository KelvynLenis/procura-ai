import { OccurrencesMap } from "@/components/Maps/OccurrencesMap";
import { Device, DeviceProps, Event, EventProps } from "@/utils/types";
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


async function fetchEvents() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents`,
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
    throw new Error(`Failed to fetch events: ${error}`);
  }

  return response.json();
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
    const [devicesData, eventsData] = await Promise.all([fetchStolenDevices(), fetchEvents()]);

    const devices: Device[] = devicesData.documents;
    const events: Event[] = eventsData.documents;

    const enrichedDevices = await Promise.all(
      devices.map(async (device: Device) => {
        const deviceEvents = await events.filter(
          (event: Event) => event.id_device === device.$id && event.is_alert_on
        );

        const recentEvent = await deviceEvents.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).at(-1);


        const ownerResponse = await fetchOwnerInfo(device.auth_id!);
        const ownerInfo = ownerResponse?.documents?.[0];

        return {
          device: {
            ...device,
          },
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