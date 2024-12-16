'use client'

import { topBrandsStolen, topDangerousDistricts } from "@/utils/ChartData"
import RechartChart from "./RechartChart"
// import Map from "./Map/Map";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import dynamic from "next/dynamic";
import { MapTiler2 } from "./Maps/MapTiler2";
import { MyMap } from "./Maps/PigeonMap";
import { PigeonMapLoader } from "./Maps/PigeonMapLoader";

const Map = dynamic(() => import('./Maps/MapTiler'), {
  ssr: false,
});

export function ChartBoard() {
  const DEFAULT_CENTER = [-7.153636, -34.8395899]

  return (
    <div className="w-full h-full flex flex-col py-5 text-xl justify-center items-center">

      <div className="lg:flex-row flex flex-col gap-5 mb-5">
        <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-[450px] xl:w-[700px] h-[500px]">
          <h2 className="text-3xxl font-black">Últimas localizações conhecidas</h2>
          <MyMap />
        </div>

        {/* <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-[450px] xl:w-[700px] h-[500px]">
          <h2 className="text-3xxl font-black">Cidades paraibanas</h2>
          <MapTiler2 mapId='cities-map' legendId="cities-legend" data="https://api.maptiler.com/data/ae6f0872-48f3-4212-85af-bffed956043e/features.json?key=QKbTJZdA6lXljsicnOEI" />
        </div> */}

        <div className="relative flex flex-col w-[250px] md:w-[700px] lg:w-[450px] xl:w-[700px] h-[500px]">
          <h2 className="text-3xxl font-black">Bairros de João Pessoa</h2>
          {/* <Map /> */}
          <MapTiler2 mapId='districts-map' legendId="districts-legend" data="https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI" />
          {/* <PigeonMapLoader /> */}
        </div>
      </div>

      <div className="flex w-[250px] md:w-full h-[300px] md:px-5 lg:px-20 self-center">
        <div className="flex flex-col w-full">
          <h2 className="font-bold">Marcas mais roubadas</h2>
          <RechartChart data={topBrandsStolen} />
        </div>

        <div className="flex flex-col w-full">
          <h2 className="font-bold">Bairros com maiores indices de roubo</h2>
          <RechartChart data={topDangerousDistricts} />
        </div>
      </div>
    </div>
  )
}