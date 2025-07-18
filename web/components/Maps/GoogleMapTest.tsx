"use client";

import { getGeoJsonData } from "@/functions/district/getGeoJsonData";
import { FeatureCollectionSchema } from "@/types/featureCollectionSchema";
import { useEffect, useRef } from "react";
import { z } from "zod";
import * as turf from '@turf/turf'
import { toast } from "react-toastify";

const api = process.env.NEXT_PUBLIC_GOOGLE_MAP_SCRIPT!
const geoJsonLink = process.env.NEXT_PUBLIC_NEIGHBORHOODS_GEOJSON_URL!
const geoJsonPB = process.env.NEXT_PUBLIC_PARAIBA_GEOJSON_URL!

export default function ParaibaMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  type geojsonType = z.infer<typeof FeatureCollectionSchema>

  let geoJsonData: geojsonType = {} as geojsonType
  let geoJsonPBData: geojsonType = {} as geojsonType

  useEffect(() => {

    Promise.all([
      getGeoJsonData(geoJsonLink).then(data => {
        geoJsonData = data
        return data
      }),
      getGeoJsonData(geoJsonPB).then(data => {
        geoJsonPBData = data

        return data
      })
    ])

    const loadScript = () => {
      if (document.getElementById("google-maps-script")) {
        initializeMap();
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = api;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();

      document.body.appendChild(script);
    };

    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: -7.1509317, lng: -34.8446769 },
         restriction: {
          latLngBounds: {
            north: -5.7,
            south: -8.5,
            east: -34.5,
            west: -38.9,
          },
          strictBounds: true, // ← se true, impede mesmo a navegação fora
        },
      });

      mapInstance.current = map;

      // map.data.addGeoJson(geoJsonPBData as any);

      // map.data.setStyle({
      //   fillColor: "#0000FF",
      //   strokeColor: "#0000FF",
      //   strokeWeight: 2,
      //   fillOpacity: 0.5,
      // });

      // map.data.setStyle({
      //   strokeColor: "#FF0000",
      //   strokeOpacity: 1,
      //   strokeWeight: 2,
      //   fillOpacity: 0,
      //   strokePattern: [
      //     {
      //       icon: {
      //         path: "M 0,-1 0,1",
      //         strokeOpacity: 1,
      //         scale: 2,
      //       },
      //       repeat: "10px",
      //     },
      //   ],
      // });

      // addGeocoderControl(map);

      map.addListener("click", (event) => {
        handleGetPosition(event.latLng);
      });
    };

    const addGeocoderControl = (map: google.maps.Map) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Buscar local...";
      input.style.cssText =
        "box-sizing: border-box; border: 1px solid transparent; width: 240px; height: 32px; margin: 10px; padding: 0 12px; border-radius: 3px; font-size: 14px; outline: none;";

      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        handleLocationSelect(place, map);
      });
    };

    const handleLocationSelect = (
      place: google.maps.places.PlaceResult,
      map: google.maps.Map
    ) => {
      const location = place.geometry!.location!;
      const latLng = {
        lat: location.lat(),
        lng: location.lng(),
      };

      map.setCenter(latLng);
      map.setZoom(12);

      setMarker(latLng, map);

      const isInParaiba = checkIfPointIsInParaiba(latLng);
      console.log(
        isInParaiba
          ? "O ponto está na Paraíba ✅"
          : "O ponto está fora da Paraíba ❌"
      );
    };

    const handleGetPosition = async (latLng: google.maps.LatLng) => {
      const position = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };


      if (mapInstance.current) {
        
        const isInParaiba = await checkIfPointIsInParaiba(position);
                
        console.log(
          isInParaiba
          ? "O ponto clicado está na Paraíba ✅"
          : "O ponto clicado está fora da Paraíba ❌"
        );

        isInParaiba && setMarker(position, mapInstance.current);
      }
    };

    const setMarker = (position: google.maps.LatLngLiteral, map: google.maps.Map) => {
      if (markerRef.current) markerRef.current.setMap(null);

      markerRef.current = new google.maps.Marker({
        position,
        map,
        title: "Ponto selecionado",
      });
    };

    const checkIfPointIsInParaiba = async (latLng: google.maps.LatLngLiteral): boolean => {

      const clickedPoint = turf.point([latLng.lng, latLng.lat])
      
      let foundState = null
  
      if (geoJsonPBData && geoJsonPBData.features) {
        for (const feature of geoJsonPBData.features) {
          if (turf.booleanPointInPolygon(clickedPoint, feature)) {
            foundState = feature
            console.log(foundState)
            break
          }
        }
      }
  
      if (!foundState) {
        toast.error('O local informado não está dentro da Paraíba')
        return false
      }

      // const point = new google.maps.LatLng(latLng.lat, latLng.lng);
      // return google.maps.geometry.poly.containsLocation(point, polygonRef.current);
      return true
    };

    loadScript();
  }, []);

  return <div ref={mapRef} style={{ width: "500px", height: "500px" }} />;
}

// Tipos globais
declare global {
  interface Window {
    google: typeof google;
  }
}
