"use client";

import { getGeoJsonData } from "@/functions/district/getGeoJsonData";
import { FeatureCollectionSchema } from "@/types/featureCollectionSchema";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import * as turf from "@turf/turf";
import { toast } from "react-toastify";
import { getNeighborhoodId } from "@/functions/district/get-neighborhood-id";

type geojsonType = z.infer<typeof FeatureCollectionSchema>;

const api = process.env.NEXT_PUBLIC_GOOGLE_MAP_SCRIPT!;
const geoJsonLink = process.env.NEXT_PUBLIC_NEIGHBORHOODS_GEOJSON_URL!;
const geoJsonPB = process.env.NEXT_PUBLIC_PARAIBA_GEOJSON_URL!;

interface GoogleMapProps {
  setPosition: (coordinates: [number, number]) => void;
  setNeighborhoodId: (districtId: string) => void;
}

export default function GoogleMap({ setPosition, setNeighborhoodId }: ParaibaMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const geoJsonPBDataRef = useRef<geojsonType | null>(null);
  const geoJsonNeighborhoodDataRef = useRef<geojsonType | null>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countdownId, setcountdownId] = useState<NodeJS.Timeout>();

  // ⬇️ Externas ao useEffect
  const setMarker = (
    position: google.maps.LatLngLiteral,
    map: google.maps.Map
  ) => {
    if (markerRef.current) markerRef.current.setMap(null);

    markerRef.current = new google.maps.Marker({
      position,
      map,
      title: "Ponto selecionado",
    });

    // setPosition([position.lat, position.lng]);
  };

  const checkIfPointIsInParaiba = (
    latLng: google.maps.LatLngLiteral
  ): boolean => {
    const data = geoJsonPBDataRef.current;
    if (!data?.features) return false;

    const point = turf.point([latLng.lng, latLng.lat]);
    for (const feature of data.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return true;
      }
    }

    toast.error("O local informado não está dentro da Paraíba");
    return false;
  };

  const checkDistrict = async (latLng: google.maps.LatLngLiteral) => {
    const data = geoJsonNeighborhoodDataRef.current;

    if (!data?.features) {
      toast.error("Houve um erro ao verificar o bairro.");
    };

    let foundFeature = null

    const point = turf.point([latLng.lng, latLng.lat]);
    for (const feature of data.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        foundFeature = feature
        break
      }
    }
    
    if (foundFeature) {
      const neighborhoodId = await getNeighborhoodId(
        Number(foundFeature?.properties?.cod_bairro)
      )
      console.log(foundFeature);

      setNeighborhoodId(neighborhoodId)
    }
  };

  const handlePredictionSelect = async (
    placeId: string,
    description: string
  ) => {
    try {
      const res = await fetch(
        `/api/select-prediction?placeId=${encodeURIComponent(placeId)}`
      );
      const json = await res.json();

      const location = json.result.geometry.location;
      const latLng = { lat: location.lat, lng: location.lng };

      setSearch(description);
      setPredictions([]);

      if (!mapInstance.current) return;

      // const isInPB = checkIfPointIsInParaiba(latLng);
      // if (!isInPB) return;
      checkDistrict(latLng)

      mapInstance.current.setCenter(latLng);
      mapInstance.current.setZoom(14);
      setMarker(latLng, mapInstance.current);
      setPosition([latLng.lng, latLng.lat]);
    } catch (err) {
      console.error("Erro ao buscar detalhes do local:", err);
      toast.error("Erro ao selecionar o local.");
    }
  };

  const handleSearchChange = (text: string) => {
    clearTimeout(countdownId);
    setSearch(text);

    if (text.length < 3) {
      setPredictions([]);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?input=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (json.status === "OK") {
          const filtered = json.predictions.filter((p: any) =>
            /PB|Paraíba/i.test(p.description)
          );
          setPredictions(filtered);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.error("Erro no autocomplete:", err);
      }
    }, 500);

    setcountdownId(timerId);
  };

  useEffect(() => {
    Promise.all([
      getGeoJsonData(geoJsonLink),
      getGeoJsonData(geoJsonPB),
    ]).then(([neighborhoodData, paraibaData]) => {
      geoJsonPBDataRef.current = paraibaData;
      geoJsonNeighborhoodDataRef.current = neighborhoodData;
      // Se precisar usar neighborhoodData também, adicione outra ref
    });

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
          strictBounds: true,
        },
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
      });

      mapInstance.current = map;

      map.addListener("click", (event) => {
        const latLng = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };

        const isInPB = checkIfPointIsInParaiba(latLng);
        if (!isInPB) return;

        checkDistrict(latLng);

        setPosition([latLng.lat, latLng.lng]);
        setMarker(latLng, map);
      });
    };

    loadScript();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl mb-4">
        <input
          type="text"
          placeholder="Buscar local..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-10 px-4 border rounded shadow-sm text-sm"
        />
        {predictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border rounded shadow max-h-60 overflow-auto">
            {predictions.map((place) => (
              <li
                key={place.place_id}
                onClick={() =>
                  handlePredictionSelect(place.place_id, place.description)
                }
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {place.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        ref={mapRef}
        className="lg:w-[500px] h-[400px] xl:h-[500px] mobile-sm:w-[280px] mobile:w-[320px] mobile-lg:w-[400px] md:w-[470px]"
      />
    </div>
  );
}

declare global {
  interface Window {
    google: typeof google;
  }
}
