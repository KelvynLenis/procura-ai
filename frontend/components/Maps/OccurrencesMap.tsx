'use client'

import React, { useState } from "react"
import { Map, Marker, GeoJson, Overlay } from "pigeon-maps"
import { geoJsonSample } from "@/utils/ChartData"
import { EventProps } from "@/utils/types";
import { set } from "zod";

interface OccurrencesMapProps {
  width?: number;
  height?: number;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  events?: EventProps[];
}

export function OccurrencesMap({ width, height, defaultCenter, defaultZoom, events }: OccurrencesMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [event, setEvent] = useState<EventProps>({} as EventProps)

  function handleOpenPopup(event: EventProps) {
    setIsOverlayOpen(!isOverlayOpen)
    setEvent(event)
  }

  const eventData: EventProps = {
    id: '1',
    lastLocation: [-7.1786937, -34.8754069],
    type: 'Roubo',
    description: 'Descrição do roubo',
    datetime: '2023-06-18T00:00:00.000Z',
    isAlertOn: true
  }

  return (
    <Map width={650} height={300} defaultCenter={[-7.1509317, -34.8446769]} defaultZoom={11}>
      {
        events && events.map((event, index) => (
          <Marker key={index} width={50} anchor={event.lastLocation} color={'#FF0000'} onClick={() => handleOpenPopup(event)} />
        ))
      }
      {/* <Marker width={50} anchor={[-7.1786937, -34.8754069]} color={'#FF0000'} onClick={() => handleOpenPopup(eventData)} /> */}
      {
        isOverlayOpen && (
          <Overlay
            anchor={[-7.1786937, -34.8754069]}
            offset={[0, 0]}
          >
            <div className="flex flex-col rounded-lg ring-1 ring-procura-ai-blue bg-white px-4 py-2" >
              <span className="self-center font-medium">{event.type}</span>
              <span className="font-light">{event.description}</span>
              <span className="text-sm text-zinc-500">{event.datetime}</span>
            </div>
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
