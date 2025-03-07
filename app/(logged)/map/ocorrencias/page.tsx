import { OccurrencesMap } from "@/components/Maps/OccurrencesMap";
import { Device, Event } from "@/utils/types";
import Link from "next/link";
import { TbArrowsMinimize } from "react-icons/tb";

export default async function Dashboard() {

  async function fetchStolenDevices() {
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
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stolen devices: ${await response.text()}`);
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
    return allDevices
  }


  async function fetchEvents(): Promise<Event[]> {
    const allEvents: Event[] = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;

    while (offset < total) {
      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "is_alert_on",
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
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`);
        }

        const { documents, total: fetchedTotal } = await response.json();
        allEvents.push(...documents);
        total = fetchedTotal;
        offset += limit;

      } catch (error) {
        console.error(error);
        break;
      }
    }
    return allEvents;
  }



  async function fetchOwnerInfo(auth_id: string) {
    const allUsers = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;

    while (offset < total) {

      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "user_id",
          values: [auth_id],
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
        const { documents, total: fetchedTotal } = await response.json();
        allUsers.push(...documents);
        total = fetchedTotal;
        offset += limit;

      } catch (error) {
        console.error(error);
        break;
      }
    }
    return allUsers;
  }


  async function getDashboardData() {
    try {
      const devicesData = await fetchStolenDevices();

      if (devicesData.length === 0) return [];

      const events = await fetchEvents();


      const enrichedDevices = await Promise.all(
        devicesData.map(async (device) => {
          const recentEvent = events
            .filter((event) => event.id_device === device.$id)
            .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];


          const ownerResponse = await fetchOwnerInfo(device.auth_id!);
          const ownerInfo = ownerResponse?.[0];
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

  let occurencesData;

  try {
    const dashboardData = await getDashboardData();

    occurencesData = dashboardData
  } catch (error) {
    console.error(error)
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