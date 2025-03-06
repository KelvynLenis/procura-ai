'use client'

import { useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder, { CarmenGeojsonFeature, MaplibreGeocoderApi } from '@maplibre/maplibre-gl-geocoder';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

// import icon from "./constants";

export default function WithLeaflet() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new maplibregl.Map({
        container: mapRef.current, // container id
        style: {
          'version': 8,
          'name': 'Blank',
          'center': [0, 0],
          'zoom': 0,
          'sources': {
              'raster-tiles': {
                'type': 'raster',
                'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                'tileSize': 256,
                'minzoom': 0,
                'maxzoom': 19
              }
          },
          'layers': [
              {
                'id': 'background',
                'type': 'background',
                'paint': {
                    'background-color': '#e0dfdf'
                }
              },
              {
                'id': 'simple-tiles',
                'type': 'raster',
                'source': 'raster-tiles'
              }
          ],
      },
      center: [-34.8446769, -7.1509317],
      zoom: 11,
      pitch: 0,
      bearing: 0,
      canvasContextAttributes: {antialias: true}
    });

    const geocoderApi: MaplibreGeocoderApi = {
      forwardGeocode: async (config) => {
          const features: CarmenGeojsonFeature[] = [];
          
          try {
              const request =
          `https://nominatim.openstreetmap.org/search?q=${
              config.query
          }&format=geojson&polygon_geojson=1&addressdetails=1`;
              const response = await fetch(request);
              const geojson = await response.json();
              for (const feature of geojson.features) {
                  const center = [
                      feature.bbox[0] +
                  (feature.bbox[2] - feature.bbox[0]) / 2,
                      feature.bbox[1] +
                  (feature.bbox[3] - feature.bbox[1]) / 2
                  ];
                  const point: CarmenGeojsonFeature = {
                      type: 'Feature',
                      geometry: {
                          type: 'Point',
                          coordinates: center
                      },
                      place_name: feature.properties.display_name,
                      properties: feature.properties,
                      text: feature.properties.display_name,
                      place_type: ['place'],
                  };
                  features.push(point);
              }
          } catch (e) {
              console.error(`Failed to forwardGeocode with error: ${e}`);
          }

          return {
              type: 'FeatureCollection',
              features: features
          };
        }
      };

      map.addControl(
          new MaplibreGeocoder(geocoderApi, {
              maplibregl
          })
      );

      return () => map.remove();
    }
  }, []);  return (     
     <div ref={mapRef} id="map" className="absolute flex w-[600px] h-[500px] m-10">
      </div>
  )
}
