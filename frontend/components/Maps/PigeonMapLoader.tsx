import { Map, GeoJsonLoader } from "pigeon-maps";

const geoJsonLink = "https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI"

export const PigeonMapLoader = () => (
  <Map height={450} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={13}>
    <GeoJsonLoader
      link={geoJsonLink}
      styleCallback={(feature, hover) =>
        hover
          ? { fill: '#FF0000', opacity: 0.75, strokeWidth: '2' }
          : { fill: '#FF0000', opacity: 0.5, strokeWidth: '1' }
      }
    />
  </Map>
)