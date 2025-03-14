'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl, { LngLatBounds, Marker } from 'maplibre-gl'
import * as maptilersdk from '@maptiler/sdk'
import * as turf from '@turf/turf'
import { toast } from 'react-toastify'
import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl'
import type { FeatureCollectionSchema } from '@/schemas/featureCollectionSchema'
import type { z } from 'zod'

import '@maptiler/geocoding-control/style.css'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MarkAsStolenMapWithGeocodingProps {
  setPosition: (coordinates: [number, number]) => void
  setNeighborhoodId: (districtId: string) => void
}

maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!
const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!

const geoJsonLink =
  'https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI'
const geoJsonPB =
  'https://api.maptiler.com/data/96b36f41-dc19-4a71-a05d-69317764eba8/features.json?key=QKbTJZdA6lXljsicnOEI'

export function MarkAsStolenMapWithGeocoding({
  setPosition,
  setNeighborhoodId,
}: MarkAsStolenMapWithGeocodingProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const markerRef = useRef<Marker | null>(null)
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0])

  type geojsonType = z.infer<typeof FeatureCollectionSchema>

  let geoJsonData: geojsonType = {} as geojsonType
  let geoJsonPBData: geojsonType = {} as geojsonType

  async function getNeighborhoodId(cod_neighborhood: string) {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'cod_neighborhood',
        values: [Number(cod_neighborhood)],
      }),
    })

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch stolen devices: ${await response.text()}`
        )
      }

      const result = await response.json()

      return result.documents[0].$id
    } catch (error) {
      console.error(error)
    }
  }

  async function handleGetPosition({
    event,
    latLng,
    map,
  }: {
    event: any
    latLng: [number, number]
    map: maplibregl.Map
  }) {
    const clickedPoint = turf.point([latLng[1], latLng[0]])

    let foundFeature = null

    // let foundState = null
    // if (geoJsonPBData) {
    //   for (const feature of geoJsonPBData.features) {
    //     if (turf.booleanPointInPolygon(clickedPoint, feature)) {
    //       foundState = feature
    //       break
    //     }
    //   }
    // }
    // if (!foundState) {
    //   toast.error("O local informado não está dentro da Paraíba")
    //   return
    // }

    if (geoJsonData) {
      for (const feature of geoJsonData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundFeature = feature
          break
        }
      }
    }

    if (foundFeature) {
      const neighborhoodId = await getNeighborhoodId(
        foundFeature?.properties?.cod_bairro
      )
      setNeighborhoodId(neighborhoodId)
    }

    setCoordinates(latLng)
    setPosition(latLng)

    return
  }

  function checkIfPointIsInParaiba({ latLng }: { latLng: [number, number] }) {
    const clickedPoint = turf.point([latLng[1], latLng[0]])

    let foundState = null

    if (geoJsonPBData) {
      for (const feature of geoJsonPBData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundState = feature
          break
        }
      }
    }

    if (!foundState) {
      toast.error('O local informado não está dentro da Paraíba')
      return false
    }

    return true
  }

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

  function setWidth() {
    if (window.innerWidth >= 1700) {
      return 1000
    } else if (window.innerWidth >= 1600) {
      return 500
    } else if (window.innerWidth >= 1400) {
      return 500
    } else if (window.innerWidth >= 1200) {
      return 500
    } else if (window.innerWidth >= 1024) {
      return 500
    } else if (window.innerWidth >= 768) {
      return 420
    } else if (window.innerWidth >= 425) {
      return 280
    } else if (window.innerWidth >= 375) {
      return 270
    } else {
      return 230
    }
  }

  function setHeight() {
    if (window.innerWidth >= 1440) {
      return 400
    } else if (window.innerWidth >= 1024) {
      return 400
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

  useEffect(() => {
    Promise.all([
      fetch(geoJsonLink)
        .then(res => res.json())
        .then(data => {
          // setGeoJsonData(data)
          geoJsonData = data
          return data
        }),
      fetch(geoJsonPB)
        .then(res => res.json())
        .then(data => {
          //  setGeoJsonPBData(data)
          geoJsonPBData = data
          return data
        }),
    ]).then(results => {
      if (!mapContainer.current) return

      const map = new maplibregl.Map({
        container: 'geocoding-control',
        style:
          'https://api.maptiler.com/maps/streets-v2/style.json?key=' + apiKey,
        center: [-34.8446769, -7.1509317],
        zoom: 12,
        maxBounds: [-38.9, -8.5, -34.5, -5.7],
      })

      const gc = new GeocodingControl({
        apiKey,
        placeholder: 'Digite o endereço ou CEP',
      })

      const getGeoJsonBounds = (geoJson: any) => {
        const bounds = new LngLatBounds()

        geoJson.features.forEach((feature: any) => {
          feature.geometry.coordinates[0].forEach((coord: any) => {
            bounds.extend(coord as [number, number])
          })
        })

        return bounds
      }

      map.on('load', () => {
        map.addSource('paraiba', {
          type: 'geojson',
          data: geoJsonPB,
        })

        map.addLayer({
          id: 'paraiba-layer',
          type: 'line',
          source: 'paraiba',
          paint: {
            'line-color': '#002E72',
            'line-width': 3,
          },
        })

        const bounds = getGeoJsonBounds(geoJsonPB)

        // Limitar o mapa
        map.setMaxBounds(bounds)
        map.fitBounds(bounds, { padding: 20 })
      })

      map.addControl(gc, 'top-left')

      gc.on('pick', e => {
        if (e.feature?.center) {
          const isPointInParaiba = checkIfPointIsInParaiba({
            latLng: [e.feature.center[1], e.feature.center[0]],
          })

          if (!isPointInParaiba) return

          handleGetPosition({
            event: e,
            latLng: [e.feature.center[1], e.feature.center[0]],
            map,
          })

          if (markerRef.current) {
            markerRef.current.remove()
          }

          markerRef.current = new Marker({
            color: '#002E72',
          })
            .setLngLat([e.feature?.center[0], e.feature?.center[1]])
            .addTo(map)
        }
      })

      map.on('click', e => {
        const isPointInParaiba = checkIfPointIsInParaiba({
          latLng: [e.lngLat.lat, e.lngLat.lng],
        })

        if (!isPointInParaiba) return

        handleGetPosition({
          event: e,
          latLng: [e.lngLat.lat, e.lngLat.lng],
          map,
        })

        if (markerRef.current) {
          markerRef.current.remove()
        }

        markerRef.current = new Marker({
          color: '#002E72',
        })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map)
      })

      return () => map.remove()
    })
  }, [])

  return (
    <div
      className="relative"
      style={{ width: setWidth(), height: setHeight() }}
    >
      <div
        ref={mapContainer}
        id="geocoding-control"
        className="w-full h-full absolute cursor-pointer"
      />
    </div>
  )
}
