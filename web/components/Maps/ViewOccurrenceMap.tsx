'use client'

import React, { useEffect, useState } from 'react'
import { Map, Marker, ZoomControl } from 'pigeon-maps'

interface MarkAsStolenMapProps {
  position: [number, number]
}

const geoJsonLink = process.env.NEXT_PUBLIC_NEIGHBORHOODS_GEOJSON_URL

export function ViewOccurrenceMap({ position }: MarkAsStolenMapProps) {
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

      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
  }

  useEffect(() => {
    fetch(geoJsonLink)
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
  }, [])

  function setWidth() {
    if (window.innerWidth >= 1440) {
      return 700
    } else if (window.innerWidth >= 1024) {
      return 700
    } else if (window.innerWidth >= 768) {
      return 680
    } else if (window.innerWidth >= 425) {
      return 361
    } else if (window.innerWidth >= 375) {
      return 310
    } else if (window.innerWidth >= 320) {
      return 260
    }

    return 200
  }

  function setHeight() {
    if (window.innerWidth >= 1440) {
      return 280
    } else if (window.innerWidth >= 1024) {
      return 280
    } else if (window.innerWidth >= 768) {
      return 280
    } else if (window.innerWidth >= 425) {
      return 340
    } else if (window.innerWidth >= 375) {
      return 300
    } else if (window.innerWidth >= 320) {
      return 270
    }
  }

  return (
    <Map
      width={setWidth()}
      height={setHeight()}
      defaultCenter={position}
      defaultZoom={13}
    >
      <ZoomControl />
      <Marker width={50} anchor={position} color={'#FF0000'} />
    </Map>
  )
}
