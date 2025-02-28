'use client'

import React, { useRef, useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";

import L from "leaflet";

// import styles from './map.module.css';

import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';

const WithLeaflet = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const center = { lng: -47.9292, lat: -15.7801 };
  const [zoom] = useState(12);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new L.Map(mapContainer.current, {
      center: L.latLng(center.lat, center.lng),
      zoom: zoom
    });

    // Create a MapTiler Layer inside Leaflet
    const mtLayer = new MaptilerLayer({
      // Get your free API key at https://cloud.maptiler.com
      apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY!,
    }).addTo(map.current);

    const geocodingControl = new GeocodingControl({
      placeholder: 'Pesquisar lugares...',
      language: 'pt-BR',
      country: 'BR',
    });

    mtLayer.on('load', () => {
      mtLayer.addControl(geocodingControl, 'top-left');
    });


  }, [center.lng, center.lat, zoom]);

  return (
    <div className='relative w-[1000px] h-[700px]'>
      <div ref={mapContainer} className='absolute w-full h-full' />
    </div>
  )
}

export default WithLeaflet;