'use client'

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import RechartChart from "./RechartChart"
import { CardChart } from "./Charts/CardChart";

// import Map from "./Map/Map";
import { OccurrencesMap } from "./Maps/OccurrencesMap";
import { PigeonMapLoader } from "./Maps/PigeonMapLoader";
import { MapTiler2 } from "./Maps/MapTiler2";
import { GoogleMapsEmbed } from '@next/third-parties/google'

import { TiDeviceTablet } from "react-icons/ti";
import { IoIosExpand } from "react-icons/io";

import { topBrandsStolen, topDangerousDistricts } from "@/utils/ChartData"
import { Device, Event, EventProps } from "@/utils/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingToast } from "./LoadingToast";

const Map = dynamic(() => import('./Maps/MapTiler'), {
  ssr: false,
});


export function ChartBoard() {
  const [occurrences, setOccurrences] = useState<EventProps[]>([])
  const [numberOfDevicesRegistered, setNumberOfDevicesRegistered] = useState(0)
  const [numberOfDevicesRecovered, setNumberOfDevicesRecovered] = useState(0)
  const [occurrencesMapSize, setOccurrencesMapSize] = useState({ width: 650, height: 300 })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

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

  async function fetchAllDevices() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents`,
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
    return response.json().then((res) => res.documents.length);
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

  async function fetchRecoveredDevices() {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "is_alert_on",
        values: [false],
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
    )

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

    const fetchRecovered = async () => {
      try {
        fetchRecoveredDevices().then((res) => setNumberOfDevicesRecovered(res.documents.length))
      } catch (error) {
        console.log(error)
      }
    }

    fetchRecovered()

    fetchOccurrences()

    fetchAllDevices().then((res) => setNumberOfDevicesRegistered(res))

  }, [])

  return (
    <>
      <div className="w-full h-full flex flex-col py-5 text-xl justify-start items-center">

        <div className="lg:flex-row flex flex-col gap-5 mb-5 self-start">
          <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-full bg-white rounded-xl ring-1 ring-zinc-300 p-4 justify-center">
            <h2 className="text-3xxl font-black text-procura-ai-blue">Localização de ocorrências</h2>
            <button onClick={showLoadingToast} title="Clique para expandir" className="group flex items-center justify-center hover:cursor-pointer z-10 hover:bg-black/40 w-[95%] h-[86%] absolute top-11 right-4">
              <IoIosExpand size={50} className="text-white hidden group-hover:flex group-hover:animate-ping" />
            </button>
            <div className="z-1">
              <OccurrencesMap occurences={occurrences} />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <CardChart variant="blue" Icon={TiDeviceTablet} number={numberOfDevicesRegistered} title="Dispositivos cadastrados" />
            <CardChart variant="green" Icon={TiDeviceTablet} number={numberOfDevicesRecovered} title="Dispositivos recuperados" />
          </div>

        </div>

      </div>

      {
        isLoading && <LoadingToast />
      }
    </>
  )
}