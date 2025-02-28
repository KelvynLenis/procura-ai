'use client'

import { MapTilerGeocodingControl } from "@/components/Maps/MapTilerGeocodingControl";
import dynamic from "next/dynamic";
import WithLeaflet from "./Maps/Map/DynamicMap";

// const Map = dynamic(() => import('./Maps/Map/DynamicMap'), {
//   ssr: false,
// });


export function TestComponent() {

  return (
    <>
      <MapTilerGeocodingControl />
      {/* <Map /> */}
      {/* <WithLeaflet /> */}
    </>
  )
}