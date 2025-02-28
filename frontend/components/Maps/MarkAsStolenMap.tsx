'use client'

import React, { useEffect, useState } from "react"
import { GeoJsonLoader, Map, Marker, ZoomControl } from "pigeon-maps"
import * as turf from "@turf/turf"
import { toast } from "react-toastify"

interface MarkAsStolenMapProps {
  setPosition: (coordinates: [number, number]) => void
  setNeighborhoodId: (districtId: string) => void
}

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"
const geoJsonPB = "https://api.maptiler.com/data/96b36f41-dc19-4a71-a05d-69317764eba8/features.json?key=QKbTJZdA6lXljsicnOEI"

export function MarkAsStolenMap({ setPosition, setNeighborhoodId }: MarkAsStolenMapProps) {
  const [isMarkerOn, setIsMarkerOn] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0])
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [geoJsonPBData, setGeoJsonPBData] = useState<any>(null)

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

    fetch(geoJsonPB)
      .then((res) => res.json())
      .then((data) => setGeoJsonPBData(data))
  }, [])

  async function getNeighborhoodId(cod_neighborhood: Number) {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "cod_neighborhood",
        values: [Number(cod_neighborhood)],
      }),
    })

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stolen devices: ${await response.text()}`);
      }

      const result = await response.json();

      return result.documents[0].$id
    } catch (error) {
      console.error(error);
    }
  }

  async function handleGetPosition({ event, latLng }: { event: MouseEvent; latLng: [number, number] }) {
    const clickedPoint = turf.point([latLng[1], latLng[0]])

    let foundState = null
    let foundFeature = null

    if (geoJsonPBData) {
      for (const feature of geoJsonPBData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundState = feature
          break
        }
      }
    }

    if (!foundState) {
      toast.error("O local informado não está dentro da Paraíba")
      return
    }

    if (geoJsonData) {
      for (const feature of geoJsonData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundFeature = feature
          break
        }
      }
    }

    if (foundFeature) {

      const neighborhoodId = await getNeighborhoodId(Number(foundFeature.properties.cod_bairro))
      setNeighborhoodId(neighborhoodId)
    }

    setIsMarkerOn(true)
    setCoordinates(latLng)
    setPosition(latLng)
  }

  function setWidth() {

    if (window.innerWidth >= 1700) {
      return 1000
    }
    else if (window.innerWidth >= 1600) {
      return 600
    }
    else if (window.innerWidth >= 1400) {
      return 600
    }
    else if (window.innerWidth >= 1200) {
      return 600
    }
    else if (window.innerWidth >= 1024) {
      return 600
    }
    else if (window.innerWidth >= 768) {
      return 420
    }
    else if (window.innerWidth >= 425) {
      return 280
    }
    else {
      return 260
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
