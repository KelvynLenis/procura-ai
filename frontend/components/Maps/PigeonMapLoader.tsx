import clsx from "clsx";
import { Map, GeoJsonLoader, Overlay } from "pigeon-maps";
import { useState } from "react";

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"



interface OverlayDataProps {
  coordinates: [number, number]
  text: string
  value: number
  color: string
}

export function PigeonMapLoader() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [OverlayData, setOverlayData] = useState<OverlayDataProps>({
    coordinates: [0, 0],
    text: '',
    value: 0,
    color: ''
  })

  function getFillColor(value: number) {
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

  return (
    <>
      <Map height={450} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={13}>
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
              setOverlayData({ coordinates: feature.payload.geometry.coordinates[0][0], text: feature.payload.properties.text, value: feature.payload.properties.value, color: getFillColor(feature.payload.properties.value) })
              console.log(getFillColor(feature.payload.properties.value))
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
            className={clsx("absolute top-10 left-5 flex w-fit p-2 rounded-md h-fit bg-white")}
            onClick={() => setIsOverlayOpen(false)}
          >
            <span className="">
              {OverlayData.text}: {OverlayData.value}
            </span>
          </div>
        )
      }
    </>
  )
}
