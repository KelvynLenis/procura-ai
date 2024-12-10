'use client'

import React, { useState } from "react"
import { Map, Marker, GeoJson, Overlay } from "pigeon-maps"
import { geoJsonSample } from "@/utils/ChartData"


export function MyMap() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  function handleOpenPopup(title: string) {
    setIsOverlayOpen(!isOverlayOpen)
  }

  return (
    <Map height={450} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={11}>
      <Marker width={50} anchor={[-7.1786937, -34.8754069]} color={'#FF0000'} onClick={() => handleOpenPopup('Ernesto Geisel')} />
      <Marker width={50} anchor={[-7.1683911, -34.8366125]} color={'#FF0000'} />
      <Marker width={50} anchor={[-7.1323427, -34.8829599]} color={'#FF0000'} />
      <Marker width={50} anchor={[-7.1172167, -34.8826629]} color={'#FF0000'} />
      <Marker width={50} anchor={[-7.1769417, -34.8390279]} color={'#FF0000'} />
      {
        isOverlayOpen && (
          <Overlay
            anchor={[-7.1786937, -34.8754069]}
            offset={[0, 0]}
          >
            <div className="bg-white p-2" >Ernesto Geisel</div>
          </Overlay>
        )
      }
      {/* {
        geoJsonSample.map((item, index) => (
          <GeoJson
            key={index}
            data={item}
            styleCallback={(feature, hover) => {
              if (feature.geometry.type === "LineString") {
                return { strokeWidth: "1", stroke: "black" };
              }
              return {
                fill: "#FF0000",
                fillOpacity: 0.5,
                strokeWidth: "1",
                stroke: "red",
                r: "20",
              };
            }}
          />
        ))
      } */}
    </Map>
  )
}

interface PopupProps {
  title: string;
  anchor: [number, number];
  offset: number[];
}
function Popup({ title, anchor, offset }: PopupProps) {

  return (
    <Overlay
      anchor={anchor}
      offset={[0, 0]}
    >
      <div className="bg-white p-2" >{title}</div>
    </Overlay>
  )
}
