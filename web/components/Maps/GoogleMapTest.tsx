"use client";

import { getGeoJsonData } from "@/functions/district/getGeoJsonData";
import { FeatureCollectionSchema } from "@/types/featureCollectionSchema";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import * as turf from '@turf/turf'
import { toast } from "react-toastify";

const api = process.env.NEXT_PUBLIC_GOOGLE_MAP_SCRIPT!
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!
const geoJsonLink = process.env.NEXT_PUBLIC_NEIGHBORHOODS_GEOJSON_URL!
const geoJsonPB = process.env.NEXT_PUBLIC_PARAIBA_GEOJSON_URL!

export default function ParaibaMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  type geojsonType = z.infer<typeof FeatureCollectionSchema>

  let geoJsonData: geojsonType = {} as geojsonType
  let geoJsonPBData: geojsonType = {} as geojsonType

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const fullQuery = `${search}, Paraíba, Brasil`; // Força busca na PB

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullQuery)}&components=country:BR&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        alert('Local não encontrado.');
        return;
      }

      const result = data.results[0];

      // Verifica se a resposta contém "Paraíba" ou "PB"
      const isParaiba = result.formatted_address.includes('Paraíba') ||
                        result.address_components?.some((comp: any) =>
                          comp.long_name === 'Paraíba' || comp.short_name === 'PB'
                        );

      if (!isParaiba) {
        alert('O local encontrado não está na Paraíba.');
        return;
      }

      const location = result.geometry.location;

      const newRegion = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      // setMarker({ latitude: location.lat, longitude: location.lng });
      // setForm({ ...form, location: [location.lat, location.lng] });
      // mapRef.current?.animateToRegion(newRegion, 1000);

    } catch (error) {
      console.error('Erro na geocodificação:', error);
      alert('Erro ao buscar localização.');
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearch(text);

    if (text.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${apiKey}&components=country:br`
      );
      const json = await res.json();

      if (json.status === 'OK') {
        // Filtra apenas sugestões com "PB" ou "Paraíba"
        const paraibaResults = json.predictions.filter((prediction: any) =>
          /PB|Paraíba/i.test(prediction.description)
        );
        console.log(paraibaResults)
        setPredictions(paraibaResults);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Erro no autocomplete:', err);
    }
  };

  const handlePredictionSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
      );
      const json = await res.json();
      const location = json.result.geometry.location;

      const region = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      // setMarker({ latitude: location.lat, longitude: location.lng });
      // setForm({ ...form, location: [location.lat, location.lng] });
      // mapRef.current?.animateToRegion(region, 1000);
      setSearch(description);
      setPredictions([]);
    } catch (err) {
      console.error('Erro ao buscar detalhes do local:', err);
    }
  };

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
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
      });

      mapInstance.current = map;

      // map.data.addGeoJson(geoJsonPBData as any);

      // map.data.setStyle({
      //   strokeColor: "#002E72",
      //   strokeWeight: 2,
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

      addGeocoderControl(map);

      map.addListener("click", (event) => {
        handleGetPosition(event.latLng);
      });
    };

    // const addGeocoderControl = (map: google.maps.Map) => {
    //   const container = document.createElement("div");
    //   container.style.cssText = `
    //     position: absolute;
    //     top: 10px;
    //     left: 10px;
    //     z-index: 1000;
    //     width: 240px;
    //   `;

    //   const input = document.createElement("input");
    //   input.type = "text";
    //   input.placeholder = "Buscar local...";
    //   input.style.cssText = `
    //     box-sizing: border-box;
    //     width: 100%;
    //     height: 32px;
    //     padding: 0 12px;
    //     border: 1px solid #ccc;
    //     border-radius: 3px;
    //     font-size: 14px;
    //   `;

    //   const resultsList = document.createElement("ul");
    //   resultsList.style.cssText = `
    //     list-style: none;
    //     margin: 0;
    //     padding: 0;
    //     background: white;
    //     border: 1px solid #ccc;
    //     max-height: 200px;
    //     overflow-y: auto;
    //     position: absolute;
    //     width: 100%;
    //     top: 36px;
    //     left: 0;
    //     z-index: 1001;
    //     display: none;
    //   `;

    //   container.appendChild(input);
    //   container.appendChild(resultsList);
    //   map.controls[google.maps.ControlPosition.TOP_LEFT].push(container);

    //   let timeout: NodeJS.Timeout;

    //   input.addEventListener("input", () => {
    //     clearTimeout(timeout);
    //     const value = input.value.trim();
    //     if (!value) {
    //       resultsList.innerHTML = "";
    //       resultsList.style.display = "none";
    //       return;
    //     }

    //     timeout = setTimeout(async () => {
    //       const res = await fetch(
    //         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    //           value
    //         )}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&language=pt-BR&components=country:br`
    //       );
    //       const data = await res.json();

    //       resultsList.innerHTML = "";
    //       if (!data.predictions || data.predictions.length === 0) {
    //         resultsList.style.display = "none";
    //         return;
    //       }

    //       resultsList.style.display = "block";
    //       data.predictions.forEach((prediction: any) => {
    //         const li = document.createElement("li");
    //         li.textContent = prediction.description;
    //         li.style.padding = "8px";
    //         li.style.cursor = "pointer";
    //         li.addEventListener("click", () => {
    //           handleSelectPlace(prediction.place_id, map);
    //           resultsList.style.display = "none";
    //         });
    //         resultsList.appendChild(li);
    //       });
    //     }, 300);
    //   });
    // };


    const addGeocoderControl = (map: google.maps.Map) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Buscar local...";
      input.style.cssText = `
        box-sizing: border-box;
        border: 1px solid transparent;
        width: 240px;
        height: 32px;
        margin: 10px;
        padding: 0 12px;
        border-radius: 3px;
        font-size: 14px;
        outline: none;
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background-color: white;
      `;
      
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        handleLocationSelect(place, map);
      });
    };

    const handleLocationSelect = async (
      place: google.maps.places.PlaceResult,
      map: google.maps.Map
    ) => {
      const location = place.geometry!.location!;
      const latLng = {
        lat: location.lat(),
        lng: location.lng(),
      };

      
      
      const isInParaiba = await checkIfPointIsInParaiba(latLng);
      console.log(
        isInParaiba
        ? "O ponto está na Paraíba ✅"
        : "O ponto está fora da Paraíba ❌"
      );
      
      if(isInParaiba) {
        setMarker(latLng, map);
        map.setCenter(latLng);
        map.setZoom(12);
      }
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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl mb-4">
        {/* <input
          type="text"
          placeholder="Buscar local..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-10 px-4 border rounded shadow-sm text-sm"
        /> */}
        {predictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border rounded shadow max-h-60 overflow-auto">
            {predictions.map((place) => (
              <li
                key={place.place_id}
                onClick={() => handlePredictionSelect(place.place_id, place.description)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {place.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={mapRef} className="lg:w-[500px] h-[400px] mobile-sm:w-[280px] mobile:w-[320px] mobile-lg:w-[400px] md:w-[470px]"  />
    </div>
  )
}

// Tipos globais
declare global {
  interface Window {
    google: typeof google;
  }
}
