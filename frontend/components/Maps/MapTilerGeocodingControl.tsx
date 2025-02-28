import * as maptilersdk from "@maptiler/sdk";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "@maptiler/geocoding-control/style.css";
import { useEffect, useRef } from 'react';

maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!;

export function MapTilerGeocodingControl() {

  const mapContainer = useRef<HTMLDivElement>(null);

  // const map = new maptilersdk.Map({
  //   container: 'geocoding-control',
  //   style: maptilersdk.MapStyle.STREETS,
  //   center: [-47.9292, -15.7801], // Brasília
  //   zoom: 12,
  // });

  // const geocodingControl = new GeocodingControl({
  //   placeholder: 'Pesquisar lugares...',
  //   language: 'pt-BR',
  //   country: 'BR',
  // });

  // map.on('load', () => {
  //   map.addControl(geocodingControl, 'top-left');
  // });


  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [-47.9292, -15.7801], // Brasília
      zoom: 12,
    });

    const geocodingControl = new GeocodingControl({
      placeholder: 'Pesquisar lugares...',
      language: 'pt-BR',
      country: 'BR',
    });

    map.on('load', () => {
      map.addControl(geocodingControl, 'top-left');
    });

    return () => map.remove();
  }, []);

  return (
    <div className="relative w-[400px] h-[400px]">
      <div ref={mapContainer} id='geocoding-control' className='w-full h-full'>
      </div>
    </div>
  )
}