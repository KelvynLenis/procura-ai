'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl, { LngLatBounds, Marker } from 'maplibre-gl'
import * as maptilersdk from '@maptiler/sdk'
import * as turf from '@turf/turf'
import { toast } from 'react-toastify'
import type { FeatureCollectionSchema } from '@/types/featureCollectionSchema'
import type { z } from 'zod'
import { getNeighborhoodId } from '@/functions/district/get-neighborhood-id'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getGeoJsonData } from '@/functions/district/getGeoJsonData'
import { CustomGeocodingControl } from '../CustomGeocoder'
import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl'

interface MarkAsStolenMapWithGeocodingProps {
  setPosition: (coordinates: [number, number]) => void
  setNeighborhoodId: (districtId: string) => void
}

maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!
const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!

const geoJsonLink = process.env.NEXT_PUBLIC_NEIGHBORHOODS_GEOJSON_URL
const geoJsonPB = process.env.NEXT_PUBLIC_PARAIBA_GEOJSON_URL

export function MarkAsStolenMapWithGeocoding({
  setPosition,
  setNeighborhoodId,
}: MarkAsStolenMapWithGeocodingProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0])
  const [mapLoaded, setMapLoaded] = useState(false)

  type geojsonType = z.infer<typeof FeatureCollectionSchema>

  let geoJsonData: geojsonType = {} as geojsonType
  let geoJsonPBData: geojsonType = {} as geojsonType

  async function handleGetPosition({
    latLng,
    map,
  }: {
    latLng: [number, number]
    map: maplibregl.Map
  }) {
    const clickedPoint = turf.point([latLng[1], latLng[0]])

    let foundFeature = null

    const data = await getGeoJsonData(geoJsonLink!).then(data => {
      geoJsonPBData = data
      return data
    })

    const geoJsonData = data

    if (geoJsonData?.features) {
      for (const feature of geoJsonData.features) {
        if (turf.booleanPointInPolygon(clickedPoint, feature)) {
          foundFeature = feature
          break
        }
      }
    }

    if (foundFeature) {
      const neighborhoodId = await getNeighborhoodId(
        Number(foundFeature?.properties?.cod_bairro)
      )
      setNeighborhoodId(neighborhoodId)
    }

    setCoordinates(latLng)
    setPosition(latLng)

    return
  }

  async function checkIfPointIsInParaiba({
    latLng,
  }: { latLng: [number, number] }) {
    const clickedPoint = turf.point([latLng[1], latLng[0]])

    const data = await getGeoJsonData(geoJsonPB!).then(data => {
      geoJsonPBData = data
      return data
    })

    geoJsonPBData = data

    let foundState = null

    if (geoJsonPBData && geoJsonPBData.features) {
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

  function calcularLarguraComponente(larguraTelaAtual: number) {
    const proporcao = 250 / 320
    return larguraTelaAtual * proporcao
  }

  function setWidth() {
    // if (window.innerWidth >= 1700) {
    //   return 500
    // } else if (window.innerWidth >= 1600) {
    //   return 500
    // } else if (window.innerWidth >= 1400) {
    //   return 500
    // } else if (window.innerWidth >= 1200) {
    //   return 500
    // } else if (window.innerWidth >= 1024) {
    //   return 500
    // } else if (window.innerWidth >= 768) {
    //   return 420
    // } else if (window.innerWidth >= 425) {
    //   return 360
    // } else if (window.innerWidth >= 412) {
    //   return 350
    // } else if (window.innerWidth >= 375) {
    //   return 310
    // } else if (window.innerWidth >= 360) {
    //   return 300 // 300 original
    // } else {
    //   return 260
    // }
    return window.innerWidth
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

  const handleLocationSelect = async (latLng: [number, number]) => {
    if (!mapRef.current) return

    const isPointInParaiba = await checkIfPointIsInParaiba({ latLng })

    if (!isPointInParaiba) return

    handleGetPosition({
      latLng,
      map: mapRef.current,
    })

    if (markerRef.current) {
      markerRef.current.remove()
    }

    markerRef.current = new Marker({
      color: '#002E72',
    })
      .setLngLat([latLng[1], latLng[0]])
      .addTo(mapRef.current)

    // Center map on the selected location
    mapRef.current.flyTo({
      center: [latLng[1], latLng[0]],
      zoom: 15,
    })
  }

  useEffect(() => {
    if (geoJsonLink && geoJsonPB) {
      Promise.all([
        getGeoJsonData(geoJsonLink).then(data => {
          geoJsonData = data
          return data
        }),
        getGeoJsonData(geoJsonPB).then(data => {
          geoJsonPBData = data
          return data
        }),
      ]).then(results => {
        if (!mapContainer.current) return

        const map = new maplibregl.Map({
          container: 'map-container',
          style:
            'https://api.maptiler.com/maps/streets-v2/style.json?key=' + apiKey,
          center: [-34.8446769, -7.1509317],
          zoom: 12,
          maxBounds: [-38.9, -8.5, -34.5, -5.7],
        })

        mapRef.current = map

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
            data: geoJsonPB!,
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

          const gc = new GeocodingControl()

          map.addControl(gc, 'top-left')

          setMapLoaded(true)
        })

        map.on('click', async e => {
          const isPointInParaiba = await checkIfPointIsInParaiba({
            latLng: [e.lngLat.lat, e.lngLat.lng],
          })

          if (!isPointInParaiba) return

          handleGetPosition({
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
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <CustomGeocodingControl
        onLocationSelect={handleLocationSelect}
        apiKey={apiKey}
      />
      <div
        className="relative"
        style={{ width: setWidth(), height: setHeight() }}
      >
        <div
          ref={mapContainer}
          id="map-container"
          className="w-full h-full absolute cursor-pointer"
        />
      </div>
    </div>
  )
}
