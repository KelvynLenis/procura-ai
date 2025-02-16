"use client"

import { cn } from "@/lib/utils";
import { District } from "@/utils/types";
import { usePathname } from "next/navigation";
import path from "path";
import { Map, GeoJsonLoader, Overlay } from "pigeon-maps";
import { useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"

interface OverlayDataProps {
  district: District
  color: string
  anchor?: any
}

interface OccurrencesHeatMapProps {
  districts: District[]
}

export function OccurrencesHeatMap({ districts }: OccurrencesHeatMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [OverlayData, setOverlayData] = useState<OverlayDataProps>({} as OverlayDataProps)

  const pathname = usePathname().slice(1)


  function handleOverlayMouseOver({ event, anchor, payload }: { event: any; anchor: any; payload: any }) {
    setIsOverlayOpen(true)
    // console.log(event)

    // Calculate offset from cursor
    const offset = { x: 10, y: 10 } // Pixels to offset from cursor
    const mouseAnchor = {
      x: event.pageX + offset.x,
      y: event.pageY + offset.y,
    }

    const district = districts.find(district => district.cod_neighborhood === Number(payload.properties.cod_bairro))

    setOverlayData({
      district,
      color: getFillColor(district?.cod_neighborhood!),
      anchor: mouseAnchor // Use mouse position instead of feature anchor
    })
  }

  function getFillColor(cod_neighborhood: number) {

    const district = districts.find(district => district.cod_neighborhood === cod_neighborhood)

    const robbery_counter = district?.robbery_counter ? district?.robbery_counter : 0
    const lost_counter = district?.lost_counter ? district?.lost_counter : 0
    const theft_counter = district?.theft_counter ? district?.theft_counter : 0

    const total = robbery_counter + lost_counter + theft_counter

    if (total <= 2) {
      return '#FEFF73';
    } else if (total <= 3) {
      return '#F47A01';
    } else if (total <= 4) {
      return '#E60000';
    } else if (total <= 20) {
      return '#F50000';
    } else {
      return '#FEFF73';
    }
  }

  function getHoverColor(cod_neighborhood: number) {
    const district = districts.find(district => district.cod_neighborhood === cod_neighborhood)
    const robbery_counter = district?.robbery_counter ? district?.robbery_counter : 0
    const lost_counter = district?.lost_counter ? district?.lost_counter : 0
    const theft_counter = district?.theft_counter ? district?.theft_counter : 0

    const total = robbery_counter + lost_counter + theft_counter

    if (total <= 2) {
      return '#FEFF73';
    } else if (total <= 3) {
      return '#F47A01';
    } else if (total <= 4) {
      return '#E60000';
    } else if (total <= 20) {
      return '#F50000';
    } else {
      return '#FEFF73';
    }
  }

  function setWidth() {
    if (pathname === 'map/bairros') {
      return window.innerWidth
    }
    else {
      return 520
    }
  }

  function setHeight() {
    if (pathname === 'map/bairros') {
      return window.innerHeight
    } else {
      return 270
    }
  }

  return (
    <>
      <Map width={setWidth()} height={setHeight()} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={13}>
        <GeoJsonLoader
          link={geoJsonLink}
          styleCallback={(feature, hover) =>
            hover
              ? { fill: getHoverColor(Number(feature.properties.cod_bairro)), opacity: 0.80, strokeWidth: '2', stroke: '#000' }
              : { fill: getFillColor(Number(feature.properties.cod_bairro)), opacity: 0.5, strokeWidth: '1', stroke: '#000' }
          }
          onMouseOver={handleOverlayMouseOver}
          onMouseOut={() => setIsOverlayOpen(false)}
        />
        <div className="absolute w-24 bottom-2 right-5 bg-black/50 py-2 px-4 rounded-md text-white">
          <h1>Legend</h1>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#FEFF73] inline-block rounded-full ring-1 ring-black" />
              0 - 2
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#F3B900] inline-block rounded-full ring-1 ring-black" />
              2 - 3
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#E60000] inline-block rounded-full ring-1 ring-black" />
              3 - 4
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#F50000] inline-block rounded-full ring-1 ring-black" />
              5 - 20
            </li>
          </ul>
        </div>
      </Map >

      {
        isOverlayOpen && (
          <Overlay className="flex w-full" anchor={OverlayData.anchor}>
            <div
              className={cn(
                "flex flex-col absolute gap-2 w-56 rounded-xl h-fit bg-primary ring-1 ring-black/50 text-white font-semibold"
              )}
              style={{
                top: `${pathname === 'map/bairros' ? OverlayData.anchor.y : -130}px`,
                left: `${pathname === 'map/bairros' ? OverlayData.anchor.x : 5}px`,
              }}
              onClick={() => setIsOverlayOpen(false)}
            >
              {/* <span
                className="w-3 h-3 rounded-full ring-1 ring-black"
                style={{ backgroundColor: OverlayData.color }}
              ></span> */}
              <div className="bg-white text-primary rounded-t-xl px-2 py-1 flex items-center break-words">
                {OverlayData.district?.name_neighborhood && OverlayData.district.name_neighborhood}
              </div>
              <div className="py-0.5 px-2">
                <span className="font-bold">
                  {OverlayData.district?.robbery_counter && OverlayData.district.robbery_counter} {OverlayData.district?.robbery_counter > 1 ? 'roubos' : 'roubo'} <br />
                  {OverlayData.district?.theft_counter && OverlayData.district.theft_counter} {OverlayData.district?.theft_counter > 1 ? 'furtos' : 'furto'} <br />
                  {OverlayData.district?.lost_counter && OverlayData.district.lost_counter} {OverlayData.district?.lost_counter > 1 ? 'perdas' : 'perda'} <br />
                </span>
              </div>
              <div className="flex gap-2 px-2">
                <FaCircleExclamation /> baixa periculosidade
              </div>
            </div>
          </Overlay>
        )
      }
    </>
  )
}