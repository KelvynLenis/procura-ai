'use client'

import React, { useEffect, useState } from "react"
import { Map, Marker, GeoJson, Overlay, ZoomControl } from "pigeon-maps"
import { geoJsonSample } from "@/utils/ChartData"
import { EventProps } from "@/utils/types";
import { usePathname } from 'next/navigation'
import { CopyToClipBoardButton } from "../CopyToClipBoardButton";
import { formatDateTime } from "@/lib/utils";
import { DeviceInfoCard } from "../DeviceInfoCard";


interface OccurrencesMapProps {
  width?: number;
  height?: number;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  occurences?: EventProps[];
}

export function OccurrencesMap({ width, height, defaultCenter, defaultZoom, occurences }: OccurrencesMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [occurence, setOccurence] = useState<EventProps>({} as EventProps)
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false)

  const pathname = usePathname().slice(1)

  function handleOpenPopup(event: EventProps) {
    pathname === 'map/ocorrencias' ? setIsOverlayOpen(true) : setIsInfoCardOpen(true)
    setOccurence(event)
  }

  function closePopup() {
    setIsInfoCardOpen(false)
    setIsOverlayOpen(false)
  }

  const size = useWindowSize();

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
  }

  function setWidth() {
    if (pathname === 'map/ocorrencias') {
      return window.innerWidth
    } else {

      console.log(window.innerWidth)

      if (!isInfoCardOpen) {
        if (window.innerWidth >= 1700) {
          return 1380
        }
        if (window.innerWidth >= 1600) {
          return 1230
        }
        else if (window.innerWidth > 1400) {
          return 1100
        }
        else if (window.innerWidth > 1200) {
          return 900
        }
        else if (window.innerWidth > 1024) {
          return 800
        }
        else if (window.innerWidth > 768) {
          return 650
        }
        else if (window.innerWidth > 475) {
          return 400
        }

        return 780
      }

      return 780
    }
  }

  function setHeight() {
    if (pathname === 'map/ocorrencias') {
      return window.innerHeight
    } else {
      return 300
    }
  }


  return (
    <>
      <Map onClick={() => closePopup()} width={setWidth()} height={setHeight()} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={11}>
        {
          occurences && occurences.map((occurence, index) => (
            <Marker key={index} width={50} anchor={occurence.event.last_location} color={'#FF0000'} onClick={() => handleOpenPopup(occurence)} />
          ))
        }
        {
          isOverlayOpen && (
            <Overlay
              anchor={occurence.event.last_location}
              offset={[0, 0]}
            >
              <div className="flex flex-col rounded-lg ring-1 ring-procura-ai-blue bg-white px-4 py-2" >
                <strong className="self-center font-medium">{occurence.event.type}</strong>
                <span className="text-sm flex items-center justify-between">{occurence.event.description}</span>
                <span className="text-sm flex items-center justify-between">
                  Imei: {occurence.device.imei}
                  <CopyToClipBoardButton text={occurence.device.imei} />
                </span>
                <span className="text-sm flex items-center justify-between">
                  Modelo: {occurence.device.phone_model}
                  <CopyToClipBoardButton text={occurence.device.phone_model} />
                </span>
                <span className="text-sm flex items-center justify-between">
                  Usuário: {occurence.user.name}
                  <CopyToClipBoardButton text={occurence.user.name} />
                </span>
                <span className="text-sm text-zinc-500 flex items-center justify-between">
                  {formatDateTime(occurence.event.time_event)}
                  <CopyToClipBoardButton text={formatDateTime(occurence.event.time_event)} />
                </span>
              </div>
            </Overlay>
          )
        }
      </Map>
      {
        isInfoCardOpen && (
          <DeviceInfoCard occurence={occurence} closePopup={closePopup} />
        )
      }
    </>
  )
}
