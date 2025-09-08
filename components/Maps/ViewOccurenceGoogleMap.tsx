"use client";

import { useEffect, useRef } from "react";

const api = process.env.NEXT_PUBLIC_GOOGLE_MAP_SCRIPT!;

interface ViewOccurenceGoogleMapProps {
  position: [number, number]
}

export default function ViewOccurenceGoogleMap({ position }: ViewOccurenceGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
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

      const [lat, lng] = position;

      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat, lng },
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

      markerRef.current = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Ponto selecionado",
      });
    };

    loadScript();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={mapRef}
        className="h-[278px] mobile-sm:w-[270px] mobile:w-[320px] mobile-lg:w-[400px] md:w-[470px] lg:w-full"
      />
    </div>
  );
}

declare global {
  interface Window {
    google: typeof google;
  }
}
