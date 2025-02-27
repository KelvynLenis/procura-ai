"use client"

import { cn } from "@/lib/utils";
import { District } from "@/utils/types";
import { usePathname } from "next/navigation";
import { Map, GeoJsonLoader, Overlay } from "pigeon-maps";
import { useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import ColorScale from "color-scales";

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
  const isFullScreen = pathname === 'map/bairros'

  const colorScale = new ColorScale(0, 7, ["#FECF3E", "#D04228"]);

  function handleOverlayMouseOver({ event, anchor, payload }: { event: any; anchor: any; payload: any }) {

    if (!isFullScreen) return;

    setIsOverlayOpen(true)
    // 

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

  function rgbaToHex(color: { r: number; g: number; b: number; a?: number }): string {
    const toHex = (value: number) => value.toString(16).padStart(2, '0');

    const { r, g, b, a = 1 } = color; // a é opcional e assume 1 se não for fornecido
    const alpha = a < 1 ? toHex(Math.round(a * 255)) : ''; // Inclui alpha se for diferente de 1

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
  }

  function getFillColor(cod_neighborhood: number) {

    const district = districts.find(district => district.cod_neighborhood === cod_neighborhood)

    const robbery_counter = district?.robbery_counter ? district?.robbery_counter : 0
    const lost_counter = district?.lost_counter ? district?.lost_counter : 0
    const theft_counter = district?.theft_counter ? district?.theft_counter : 0

    const total = robbery_counter + lost_counter + theft_counter

    let colorObj = colorScale.getColor(total);

    return rgbaToHex(colorObj);

    // if (total <= 2) {
    //   return '#FECF3E';
    // } else if (total <= 3) {
    //   return '#F3AD39';
    // } else if (total <= 4) {
    //   return '#E78A33';
    // } else if (total <= 20) {
    //   return '#DC662E';

    // } else if (total <= 30) {
    //   return '#D04228';
    // } else {
    //   return '#FEFF73';
    // }
  }

  function getHoverColor(cod_neighborhood: number) {
    const district = districts.find(district => district.cod_neighborhood === cod_neighborhood)
    const robbery_counter = district?.robbery_counter ? district?.robbery_counter : 0
    const lost_counter = district?.lost_counter ? district?.lost_counter : 0
    const theft_counter = district?.theft_counter ? district?.theft_counter : 0

    const total = robbery_counter + lost_counter + theft_counter

    let colorObj = colorScale.getColor(total);

    return rgbaToHex(colorObj);

    // if (total <= 2) {
    //   return '#FECF3E';
    // } else if (total <= 3) {
    //   return '#F3AD39';
    // } else if (total <= 4) {
    //   return '#E78A33';
    // } else if (total <= 20) {
    //   return '#DC662E';
    // } else if (total <= 30) {
    //   return '#D04228';
    // } else {
    //   return '#FEFF73';
    // }
  }

  function setWidth() {
    if (isFullScreen) {
      return window.innerWidth
    }
    else {
      return 520
    }
  }

  function setHeight() {
    if (isFullScreen) {
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
        {/* <div className="absolute h-48 bottom-2 right-5 bg-black/50 py-2 px-4 rounded-md text-white flex flex-col items-center">
          <h1>Legenda</h1>
          <div className="flex items-center gap-2 h-full">
            <div
              className="w-4 h-full rounded-md rotate-180"
              style={{
                background: 'linear-gradient(180deg, #FECF3E 0%, #D04228 100%)',
              }}
            />
            <div className="flex flex-col justify-between h-full text-xs">
              <span>5</span>
              <span>0</span>
            </div>
          </div>
        </div> */}

        {/* <div className="absolute w-24 bottom-2 right-5 bg-black/50 py-2 px-4 rounded-md text-white">
          <h1>Legend</h1>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#FECF3E] inline-block rounded-full ring-1 ring-black" />
              0 - 2
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#F3AD39] inline-block rounded-full ring-1 ring-black" />
              2 - 3
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#E78A33] inline-block rounded-full ring-1 ring-black" />
              3 - 4
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#DC662E] inline-block rounded-full ring-1 ring-black" />
              5 - 20
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#D04228] inline-block rounded-full ring-1 ring-black" />
              5 - 20
            </li>
          </ul>
        </div> */}


        <div className="absolute w-28 bottom-2 right-5 bg-black/50 py-2 px-4 rounded-md text-white">
          <h1>Legend</h1>
          <ul className="flex flex-col gap-0">
            <li className="flex items-center gap-2 h-fit">
              <span className="w-6 h-5 p-1 bg-[#FECF3E] inline-block" />
              0 - 2
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-5 p-1 bg-[#F3AD39] inline-block" />
              2 - 3
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-5 p-1 bg-[#E78A33] inline-block" />
              4 - 5
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-5 p-1 bg-[#DC662E] inline-block" />
              6 - 20
            </li>

            <li className="flex items-center gap-2">
              <span className="w-6 h-5 p-1 bg-[#D04228] inline-block" />
              20+
            </li>
          </ul>
        </div>

      </Map>
      {
        isOverlayOpen && (
          <Overlay className="flex w-full" anchor={OverlayData.anchor}>
            <div
              className={cn(
                "flex flex-col absolute gap-2 w-56 rounded-xl h-fit bg-primary ring-1 ring-black/50 text-white font-semibold"
              )}
              style={{
                top: `${isFullScreen ? OverlayData.anchor.y : -130}px`,
                left: `${isFullScreen ? OverlayData.anchor.x : 5}px`,
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