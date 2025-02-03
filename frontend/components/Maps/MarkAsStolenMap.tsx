'use client'

import React, { useEffect, useState } from "react"
import { GeoJsonLoader, Map, Marker, ZoomControl } from "pigeon-maps"
import * as turf from "@turf/turf"

interface MarkAsStolenMapProps {
  setPosition: (coordinates: [number, number]) => void
  setBairro: (codBairro: number) => void
}

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"

export function MarkAsStolenMap({ setPosition, setBairro }: MarkAsStolenMapProps) {
  const [isMarkerOn, setIsMarkerOn] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0])
  const [geoJsonData, setGeoJsonData] = useState<any>(null)

  const size = useWindowSize()

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    })

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      handleResize()
      return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowSize
  }

  useEffect(() => {
    fetch(geoJsonLink)
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
  }, [])

  function handleGetPosition({ event, latLng }: { event: MouseEvent; latLng: [number, number] }) {
    console.log("Coordenadas do clique:", latLng)

    const clickedPoint = turf.point([latLng[1], latLng[0]])

    let foundFeature = null
    if (geoJsonData) {
      for (const feature of geoJsonData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundFeature = feature
          break
        }
      }
    }

    if (foundFeature) {
      console.log("O ponto pertence a:", foundFeature.properties)
      setBairro(foundFeature.properties.cod_bairro)
    } else {
      console.log("O ponto não pertence a nenhuma área do GeoJSON.")
    }

    setIsMarkerOn(true)
    setCoordinates(latLng)
    setPosition(latLng)
  }

  function setWidth() {

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
    else if (window.innerWidth >= 1024) {
      return 700
    }
    else if (window.innerWidth >= 768) {
      return 450
    }
    else if (window.innerWidth >= 425) {
      return 300
    }
    else {
      return 240
    }
  }

  return (
    <Map
      width={setWidth()}
      height={size.width < 768 ? size.height / 2.5 : size.height / 1.5}
      defaultCenter={[-7.1509317, -34.8446769]}
      defaultZoom={11}
      onClick={({ event, latLng }) => handleGetPosition({ event, latLng })}
    >
      <ZoomControl />
      {/* <GeoJsonLoader
        link={geoJsonLink}
        styleCallback={(feature, hover) =>
          hover
            ? { fill: "#FEFF73", opacity: 0.2, strokeWidth: '2', stroke: '#000' }
            : { fill: "#FEFF73", opacity: 0.0, strokeWidth: '2', stroke: '#000' }
        }
      /> */}
      {isMarkerOn && <Marker width={50} anchor={coordinates} color={"#FF0000"} />}
    </Map>
  )
}
