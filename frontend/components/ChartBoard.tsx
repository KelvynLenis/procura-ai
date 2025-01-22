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
import { EventProps } from "@/utils/types";

const Map = dynamic(() => import('./Maps/MapTiler'), {
  ssr: false,
});


export function ChartBoard() {
  const [occurrences, setOccurrences] = useState<EventProps[]>([])
  const [numberOfDevicesRegistered, setNumberOfDevicesRegistered] = useState(0)
  const [numberOfDevicesRecovered, setNumberOfDevicesRecovered] = useState(0)
  const [occurrencesMapSize, setOccurrencesMapSize] = useState({ width: 650, height: 300 })
  // const { toggleSidebar } = useSidebar()

  function handleExpandOccurrencesMap() {
    // toggleSidebar()

    setOccurrencesMapSize({
      width: window.innerWidth,
      height: window.innerHeight
    })

    console.log(occurrencesMapSize)
  }

  useEffect(() => {
    // @glaymar
    // Puxa as ocorrencias do banco de dados
    const fetchOccurrences = async () => {
      try {

      } catch (error) {

      }
    }

    // @glaymar
    // seta o total de dispositivos cadastrados
    setNumberOfDevicesRegistered(0)

    // @glaymar
    // seta o total de dispositivos recuperados
    setNumberOfDevicesRecovered(0)

  }, [])

  return (
    <div className="w-full h-full flex flex-col py-5 text-xl justify-start items-center">

      <div className="lg:flex-row flex flex-col gap-5 mb-5 self-start">
        <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-full bg-white rounded-xl ring-1 ring-zinc-300 p-4 justify-center">
          <h2 className="text-3xxl font-black text-procura-ai-blue">Localização de ocorrências</h2>
          {/* <button onClick={handleExpandOccurrencesMap} type="button" title="Clique para expandir" className="group flex items-center justify-center hover:cursor-pointer z-10 hover:bg-black/40 w-[95%] h-[82%] absolute top-11 right-">
            <IoIosExpand size={50} className="text-white hidden group-hover:flex group-hover:animate-ping" />
          </button>
          <div className="z-1">
            <OccurrencesMap events={occurrences} />
          </div> */}
          <Map />
        </div>

        {/* <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-[450px] xl:w-[700px] h-[500px]">
          <h2 className="text-3xxl font-black">Cidades paraibanas</h2>
          <MapTiler2 mapId='cities-map' legendId="cities-legend" data="https://api.maptiler.com/data/ae6f0872-48f3-4212-85af-bffed956043e/features.json?key=QKbTJZdA6lXljsicnOEI" />
          </div> */}

        {/* <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-[450px] h-[500px]">
          <h2 className="text-3xxl font-black">Bairros de João Pessoa</h2>
          <MapTiler2 mapId='districts-map' legendId="districts-legend" data="https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI" />
          <PigeonMapLoader />
        </div> */}
      </div>

      <div className="flex gap-5">
        <CardChart variant="blue" Icon={TiDeviceTablet} number={numberOfDevicesRegistered} title="Dispositivos cadastrados" />
        <CardChart variant="green" Icon={TiDeviceTablet} number={numberOfDevicesRecovered} title="Dispositivos recuperados" />
      </div>

      {/* <div className="flex w-[250px] md:w-full h-[300px] md:px-5 lg:px-20 self-center">
        <div className="flex flex-col w-full">
          <h2 className="font-bold">Marcas mais roubadas</h2>
          <RechartChart data={topBrandsStolen} />
        </div>

        <div className="flex flex-col w-full">
          <h2 className="font-bold">Bairros com maiores indices de roubo</h2>
          <RechartChart data={topDangerousDistricts} />
        </div>
      </div> */}
    </div>
  )
}