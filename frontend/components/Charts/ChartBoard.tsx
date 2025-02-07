'use client'

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import RechartChart from "./RechartChart"
import { CardChart } from "./CardChart";

// import Map from "./Map/Map";
import { OccurrencesMap } from "../Maps/OccurrencesMap";
import { PigeonMapLoader } from "../Maps/PigeonMapLoader";
import { MapTiler2 } from "../Maps/MapTiler2";
import { GoogleMapsEmbed } from '@next/third-parties/google'

import { BiExpandAlt } from "react-icons/bi";

import { topBrandsStolen, topDangerousDistricts } from "@/utils/ChartData"
import { Device, Event, EventProps } from "@/utils/types";
import { useRouter } from "next/navigation";
import { LoadingToast } from "../LoadingToast";
import PieChartRechart from "./PieChartRechart";

const Map = dynamic(() => import('../Maps/MapTiler'), {
  ssr: false,
});


export function ChartBoard() {
  const [occurrences, setOccurrences] = useState<EventProps[]>([])
  const [numberOfDevicesRegistered, setNumberOfDevicesRegistered] = useState(0)
  const [numberOfDevicesRecovered, setNumberOfDevicesRecovered] = useState(0)
  const [numberOfDevicesStolen, setNumberOfDevicesStolen] = useState(0)
  const [numberOfDevicesLost, setNumberOfDevicesLost] = useState(0)
  const [occurrencesMapSize, setOccurrencesMapSize] = useState({ width: 650, height: 300 })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

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
          console.log(recentEvent)

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

  async function fetchAllDevices() {
    const allDevices: Device[] = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;
    while (offset < total) {
      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "limit",
          values: [limit],
        }),
        "queries[1]": JSON.stringify({
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
        setNumberOfDevicesRegistered(fetchedTotal)


      } catch (error) {
        console.error(error);
        break;
      }

    }
    return allDevices
  }
  async function getNumberOfRecoveredDevices() {
    const allEvents: Event[] = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;
    while (offset < total) {

      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "type",
          values: ["recuperado"],
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
              "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
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

        setNumberOfDevicesRecovered(fetchedTotal);
      } catch (error) {
        console.error(error);
        break;
      }
    }
    return allEvents;
  }
  async function getNumberOfLostDevices() {
    const allDevices: Device[] = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;
    while (offset < total) {
      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "type",
          values: ["Extravio ou Perda", "Perda"],
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
        setNumberOfDevicesLost(fetchedTotal)
      } catch (error) {
        console.error(error);
        break;
      }

    }
    return allDevices
  }

  async function getNumberOfAllStolenDevices() {
    const allEvents: Event[] = [];
    let offset = 0;
    const limit = 25;
    let total = Infinity;

    while (offset < total) {
      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "type",
          values: ["Furto simples", "Roubo", "Furto"],
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
              "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
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
        setNumberOfDevicesStolen(fetchedTotal);
      } catch (error) {
        console.error(error);
        break;
      }
    }
    return allEvents;
  }



  function showLoadingToast() {
    setIsLoading(true)
    router.push(`/map/ocorrencias`)
  }

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        const dashboardData = await getDashboardData();
        console.log(dashboardData);

        setOccurrences(dashboardData)
      } catch (error) {
        console.log(error)
      }
    }


    fetchOccurrences()
    fetchStolenDevices()
    getNumberOfRecoveredDevices()
    getNumberOfLostDevices()
    getNumberOfAllStolenDevices()
    fetchAllDevices()

  }, [])

  return (
    <>
      <div className="w-full h-full flex flex-col py-5 justify-start items-center gap-5">

        <div className="relative flex flex-col md:mr-2 self-start md:w-3/5 lg:w-8/12 xl:w-full bg-white rounded-xl ring-1 ring-zinc-300 p-4 justify-center gap-3">
          <div className="flex justify-between">
            <h2 className="text-3xxl font-black text-procura-ai-blue">Localização de ocorrências</h2>
            <button onClick={showLoadingToast} title="Clique para expandir" className="flex text-procura-ai-blue items-center gap-1 text-sm hover:opacity-50">
              Expandir
              <BiExpandAlt size={18} />
            </button>
          </div>

          <div className="flex gap-4">
            <OccurrencesMap occurences={occurrences} />
          </div>

        </div>

        <div className="flex self-start gap-5">
          <CardChart variant="blue" number={numberOfDevicesRegistered} title="Dispositivos cadastrados" />
          <CardChart variant="green" number={numberOfDevicesRecovered} title="Dispositivos recuperados" />
          <CardChart variant="red" number={numberOfDevicesStolen} title="Dispositivos Roubados" />
          <CardChart variant="yellow" number={numberOfDevicesLost} title="Dispositivos Perdidos" />
        </div>

        <div className="flex w-full justify-around">
          <div className="flex flex-col gap-2 w-[540px] text-sm bg-white items-center justify-center h-80 ring-1 ring-zinc-300 rounded-lg self-start">
            <span className="flex flex-col w-full items-start px-4 pt-3 font-semibold text-procura-ai-blue">
              Dispositivos cadastrados
              <span className="font-medium">
                Status
              </span>
            </span>
            <PieChartRechart numberOfDevicesRegistered={numberOfDevicesRegistered} numberOfDevicesLost={numberOfDevicesLost} numberOfDevicesRecovered={numberOfDevicesRecovered} numberOfDevicesStolen={numberOfDevicesStolen} />
          </div>

          <div className="flex flex-col gap-2 w-[540px] p-3 text-sm bg-white items-center justify-center h-80 ring-1 ring-zinc-300 rounded-lg self-start">
            <span className="flex flex-col w-full items-start self-start font-semibold text-procura-ai-blue">
              Ocorrências distribuídas nos bairros de João Pessoa
            </span>

            <div className="w-full h-full flex items-center justify-center bg-zinc-200 rounded-sm" >
              <span className="text-zinc-400 text-xl">Em breve</span>
            </div>
          </div>
        </div>

      </div>

      {
        isLoading && <LoadingToast />
      }
    </>
  )
}