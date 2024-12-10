'use client'

import React, { useRef, useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const center = { lng: -34.8474964, lat: -7.1390735 };
  const [zoom] = useState(12);

  useEffect(() => {
    if (map.current) return;

    map.current = new L.Map(mapContainer.current, {
      center: L.latLng(center.lat, center.lng),
      zoom: zoom,
    });

    const mtLayer = new MaptilerLayer({
      apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY,
    }).addTo(map.current);

    // map.current.addLayer(mtLayer);

    new L.Marker(L.latLng(-7.1786937, -34.8754069)).addTo(map.current);
    new L.Marker(L.latLng(-7.1683911, -34.8366125)).addTo(map.current);
    new L.Marker(L.latLng(-7.1323427, -34.8829599)).addTo(map.current);
    new L.Marker(L.latLng(-7.1172167, -34.8826629)).addTo(map.current);
    new L.Marker(L.latLng(-7.1769417, -34.8390279)).addTo(map.current);

  }, [center.lng, center.lat, zoom]);

  return (
    <div className='relative w-full h-full'>
      <div ref={mapContainer} className='absolute w-full h-full' />
    </div>
  )
}

export default Map

