'use client'

import dynamic from "next/dynamic";
import WithLeaflet from "./Maps/Map/DynamicMap";
import { MarkAsStolenMapWithGeocoding } from "./Maps/MarkAsStolenMapWithGeocoding";

const Map = dynamic(() => import('./Maps/Map/DynamicMap'), {
  ssr: false,
});


export function TestComponent() {

  return (
    <>
      <MarkAsStolenMapWithGeocoding />
      {/* <Map /> */}
      {/* <WithLeaflet /> */}
    </>
  )
}