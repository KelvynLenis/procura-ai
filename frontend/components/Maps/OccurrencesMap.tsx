'use client'

import React, { useEffect, useState } from "react"
import { Map, Marker, GeoJson, Overlay, ZoomControl } from "pigeon-maps"
import { EventProps } from "@/utils/types";
import { usePathname } from 'next/navigation'
import { DeviceInfoCard } from "../DeviceInfoCard";
import { Home, Triangle } from "lucide-react";
import Image from "next/image";
import theft from '../../assets/icons/theft.svg'
import warning from '../../assets/icons/warning.png'
import steal from '../../assets/icons/steal.png'
import alarm from '../../assets/icons/alarm.png'
import robbery from '../../assets/icons/robbery.png'
import interrogation from '../../assets/icons/interrogation.png'
import lost from '../../assets/icons/lost.svg'


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
      if (!isInfoCardOpen) {
        if (window.innerWidth >= 2560) {
          return window.innerWidth * 0.9
        }
        else if (window.innerWidth < 1200) {
          return window.innerWidth * 0.85
        }
        else if (window.innerWidth < 1440) {
          return window.innerWidth * 0.90
        }
        else if (window.innerWidth < 1700) {
          return window.innerWidth * 0.9
        }
        else if (window.innerWidth < 2560) {
          return window.innerWidth * 0.8
        }
      }
      else if (isInfoCardOpen) {
        if (window.innerWidth >= 2560) {
          return window.innerWidth * 0.90
        }
        else if (window.innerWidth < 1200) {
          return window.innerWidth * 0.4
        }
        else if (window.innerWidth < 1700) {
          return window.innerWidth * 0.75
        }
        else if (window.innerWidth < 2560) {
          return window.innerWidth * 0.8
        }
      }
      return 700
    }
  }

  function setHeight() {
    if (pathname === 'map/ocorrencias') {
      return window.innerHeight
    } else {
      return 300
    }
  }

  function getIcon(type: string) {

    if (type === 'Furto' || type === 'Furto simples' || type === 'Roubo') {
      return <Image src={steal} style={{ pointerEvents: "auto", cursor: "pointer" }} alt="furto" className="w-12 h-12 relative top-2 left-4" />
    } else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return <Image src={interrogation} style={{ pointerEvents: "auto", cursor: "pointer" }} alt="perda" className="w-10 h-10 relative top-2.5 left-4" />
    }
  }

  function getColor(type: string) {
    if (type === 'Furto' || type === 'Furto simples') {
      return '#f97316'
    } else if (type === 'Roubo') {
      return '#EF4444'
    }
    else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return '#EAB308'
    }
  }

  return (
    <>
      <Map onClick={() => closePopup()} width={setWidth()} height={setHeight()} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={11}>
        {
          occurences && occurences.map((occurence, index) => (
            occurence.event?.last_location &&
            <Marker key={index} width={50} anchor={occurence.event?.last_location} color={getColor(occurence.event?.type)} onClick={() => handleOpenPopup(occurence)} />
          ))
        }
        {
          isOverlayOpen && (
            <Overlay
              anchor={occurence.event?.last_location}
              offset={[0, 0]}
            >
              <div className="flex flex-col relative -translate-x-1/2 rounded-lg ring-1 ring-procura-ai-blue bg-white px-4 py-2" >
                <Triangle className="text-white absolute fill-white -top-3 left-[46%]" />
                <DeviceInfoCard occurence={occurence} closePopup={closePopup} styles="w-full ring-0 h-fit" />
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
