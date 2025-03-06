'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Marker } from "maplibre-gl";
import * as maptilersdk from '@maptiler/sdk';
import * as turf from "@turf/turf"
import { toast } from "react-toastify"
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import { FeatureCollectionSchema } from "@/schemas/featureCollectionSchema";
import { z } from "zod";
import { Feature, Geometry } from 'geojson';

import "@maptiler/geocoding-control/style.css";
import "maplibre-gl/dist/maplibre-gl.css";

interface MarkAsStolenMapWithGeocodingProps {
  setPosition: (coordinates: [number, number]) => void
  setNeighborhoodId: (districtId: string) => void
}

maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!;
const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!;

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"
const geoJsonPB = "https://api.maptiler.com/data/96b36f41-dc19-4a71-a05d-69317764eba8/features.json?key=QKbTJZdA6lXljsicnOEI"


export function MarkAsStolenMapWithGeocoding({ setPosition, setNeighborhoodId }: MarkAsStolenMapWithGeocodingProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Marker | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0])

  type geojsonType = z.infer<typeof FeatureCollectionSchema>

  let geoJsonData: geojsonType = {} as geojsonType
  let geoJsonPBData: geojsonType = {} as geojsonType

  async function getNeighborhoodId(cod_neighborhood: string) {
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
  
  async function handleGetPosition({ event, latLng, map }: { 
    event: any; 
    latLng: [number, number],
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
      const neighborhoodId = await getNeighborhoodId(foundFeature?.properties?.cod_bairro)
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
      toast.error("O local informado não está dentro da Paraíba")
      return false
    }

    return true
  }

  useEffect(() => {
    Promise.all([
      fetch(geoJsonLink)
       .then((res) => res.json())
       .then((data) => {
        // setGeoJsonData(data)
        geoJsonData = data
        return data
      }),
      fetch(geoJsonPB)
       .then((res) => res.json())
       .then((data) => {
        //  setGeoJsonPBData(data)
        geoJsonPBData = data
         return data
        })
      ]).then((results) => {

        if (!mapContainer.current) return;
     
        const map = new maplibregl.Map({
          container: 'geocoding-control',
          style: "https://api.maptiler.com/maps/streets-v2/style.json?key=" + apiKey,
          center: [-34.8446769, -7.1509317],
          zoom: 12,
        });
        
        const gc = new GeocodingControl({
          apiKey,
          placeholder: 'Digite o endereço ou CEP',
        });
     
        map.addControl(gc, 'top-left');
     
        gc.on('pick', (e) => {
          if (e.feature?.center) {
            const isPointInParaiba =  checkIfPointIsInParaiba({ latLng: [e.feature.center[1], e.feature.center[0]] })

            if (!isPointInParaiba) return

            handleGetPosition({ event: e, latLng: [e.feature.center[1], e.feature.center[0]], map })
            
            if (markerRef.current) {
              markerRef.current.remove()
            }
            
            markerRef.current = new Marker({
              color: '#002E72'
            })
              .setLngLat([e.feature?.center[0], e.feature?.center[1]])
              .addTo(map)
          }
        })
     
        map.on("click", (e) => {
          const isPointInParaiba =  checkIfPointIsInParaiba({ latLng: [e.lngLat.lat, e.lngLat.lng] })
            
          if (!isPointInParaiba) return
          
          handleGetPosition({ event: e, latLng: [e.lngLat.lat, e.lngLat.lng], map })
            
          if (markerRef.current) {
            markerRef.current.remove()
          }

            markerRef.current = new Marker({
            color: '#002E72'
          })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map)
        })
     
        return () => map.remove();
      })


  }, []);

  return (
    <div className="relative w-[500px] h-[400px]">
      <div ref={mapContainer} id='geocoding-control' className='w-full h-full absolute cursor-pointer'></div>
    </div>
  )
}