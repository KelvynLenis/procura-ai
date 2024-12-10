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
    <div className="w-full h-full flex flex-col py-5 text-xl">

      <div className="lg:flex-row flex flex-col gap-5 mb-5">
        <div className="relative flex flex-col w-[600px] h-[500px]">
          <h2 className="text-3xxl font-black">Últimas localizações conhecidas</h2>
          {/* <Map /> */}
          <MyMap />
        </div>

        <div className="relative flex flex-col w-[600px] h-[500px]">
          <h2 className="text-3xxl font-black">Bairros com maiores indices de roubo</h2>
          {/* <Map /> */}
          <MapTiler2 />
          {/* <PigeonMapLoader /> */}
        </div>
      </div>

      <div className="flex w-full h-[300px]">
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