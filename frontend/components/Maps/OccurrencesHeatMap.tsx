import { cn } from "@/lib/utils";
import { District } from "@/utils/types";
import { Map, GeoJsonLoader, Overlay } from "pigeon-maps";
import { useState } from "react";

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"

interface OverlayDataProps {
  district: District
  color: string
}

interface OccurrencesHeatMapProps {
  districts: District[]
}

export function OccurrencesHeatMap({ districts }: OccurrencesHeatMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [OverlayData, setOverlayData] = useState<OverlayDataProps>({} as OverlayDataProps)


  function handleOverlayMouseOver(feature: any) {
    console.log(feature.payload.properties.cod_bairro)

    // console.log(typeof Number(feature.payload.properties.cod_bairro))

    setIsOverlayOpen(true)

    const district = districts.find(district => district.cod_neighborhood === Number(feature.payload.properties.cod_bairro))

    const total = district!.theft_counter + district!.lost_counter + district!.robbery_counter
    setOverlayData({
      district,
      color: getFillColor(total)
    })
    console.log(district)
  }

  function getFillColor(value: number) {
    switch (value) {
      case 3:
        return '#FEFF73';
      case 4:
        return '#F3B900';
      case 17:
        return '#F47A01';
      case 24:
        return '#E60000';
      case 32:
        return '#A80000';
      default:
        return '#FEFF73';
    }
  }

  function getHoverColor(value: number) {
    switch (value) {
      case 5:
        return '#FEFF73';
      case 9:
        return '#F3B900';
      case 17:
        return '#F47A01';
      case 24:
        return '#E60000';
      case 32:
        return '#F50000';
      default:
        return '#FEFF73';
    }
  }

  function setWidth() {

    // if (window.innerWidth >= 2560) {
    //   return window.innerWidth * 0.85
    // }
    // else if (window.innerWidth < 1200) {
    //   return window.innerWidth * 0.6
    // }
    // else if (window.innerWidth < 1700) {
    //   return window.innerWidth * 0.75
    // }
    // else if (window.innerWidth < 2560) {
    //   return window.innerWidth * 0.8
    // }
    return 520

  }

  function setHeight() {
    return 270
  }

  return (
    <>
      <Map width={setWidth()} height={setHeight()} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={13}>
        <GeoJsonLoader
          link={geoJsonLink}
          styleCallback={(feature, hover) =>
            hover
              ? { fill: getHoverColor(feature.properties.value), opacity: 0.80, strokeWidth: '2', stroke: '#000' }
              : { fill: getFillColor(feature.properties.value), opacity: 0.5, strokeWidth: '1', stroke: '#000' }
          }
          onMouseOver={
            (feature) => {
              setIsOverlayOpen(true)
              setOverlayData({ district: feature.payload.properties, color: getFillColor(feature.payload.properties.value) })
              // console.log(getFillColor(feature.payload.properties.value))
              // console.log(feature.payload.properties)
              handleOverlayMouseOver(feature)
            }
          }
          onMouseOut={() => setIsOverlayOpen(false)}
        />
        <div className="absolute w-36 top-2 right-2 bg-black/50 py-2 px-4 rounded-md text-white">
          <h1>Legend</h1>
          <ul className="flex flex-wrap gap-2">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#FEFF73] inline-block rounded-full ring-1 ring-black" />
              0 - 8
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#F3B900] inline-block rounded-full ring-1 ring-black" />
              8 - 16
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#E60000] inline-block rounded-full ring-1 ring-black" />
              17 - 23
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#E60000] inline-block rounded-full ring-1 ring-black" />
              24 - 31
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 p-1 bg-[#A80000] inline-block rounded-full ring-1 ring-black" />
              32 - 39
            </li>
          </ul>
        </div>
      </Map>

      {
        isOverlayOpen && (
          <div
            className={cn("absolute top-5 left-5 flex w-fit p-2 rounded-md h-fit bg-white ring-1 ring-black/50", `bg-[${OverlayData.color}]`)}
            onClick={() => setIsOverlayOpen(false)}
          >
            <span className="font-bold">
              {OverlayData.district?.name_neighborhood && OverlayData.district.name_neighborhood} <br />
              No. Roubos {OverlayData.district?.robbery_counter && OverlayData.district.robbery_counter} <br />
              No. Furtos {OverlayData.district?.theft_counter && OverlayData.district.theft_counter} <br />
              No. Perdidos {OverlayData.district?.lost_counter && OverlayData.district.lost_counter} <br />
            </span>
          </div>

        )
      }
    </>
  )
}
