'use client'

import React, { useEffect, useState } from "react"
import { Map, Marker, ZoomControl } from "pigeon-maps"

interface MarkAsStolenMapProps {
  setPosition: (coordinates: [number, number]) => void
}

export function MarkAsStolenMap({ setPosition }: MarkAsStolenMapProps) {
  const [isMarkerOn, setIsMarkerOn] = useState(false)
  const [coordinates, setCoordinates] = useState<number[]>([])

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

  function handleGetPosition({ event, latLng, pixel }: {
    event: MouseEvent;
    latLng: [number, number];
    pixel: [number, number];
  }) {
    console.log(event, latLng, pixel)
    setIsMarkerOn(true)
    setCoordinates(latLng)

    setPosition(latLng)
  }

  function setWidth(width: number) {
    if (width < 768) {
      return 230
    } else if (width < 1024) {
      return 400
    } else {
      return 600
    }
  }

  return (
    <Map width={setWidth(size.width)} height={size.width < 768 ? size.height / 2.5 : size.height / 1.5} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={11} onClick={({ event, latLng, pixel }) => handleGetPosition({ event, latLng, pixel })}>
      <ZoomControl />
      {isMarkerOn && (
        <Marker width={50} anchor={coordinates} color={'#FF0000'} />
      )}
    </Map>
  )
}