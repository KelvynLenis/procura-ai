'use client'

import React, { useEffect, useState } from 'react'
import { Map, Marker, GeoJson, Overlay, ZoomControl } from 'pigeon-maps'
import type { OccurrencesProps } from '@/types'
import { usePathname } from 'next/navigation'
import { EventDetails } from '../EventDetails'
import { Home, Triangle, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import theft from '../../assets/icons/theft.svg'
import warning from '../../assets/icons/warning.png'
import steal from '../../assets/icons/steal.png'
import alarm from '../../assets/icons/alarm.png'
import robbery from '../../assets/icons/robbery.png'
import interrogation from '../../assets/icons/interrogation.png'
import lost from '../../assets/icons/lost.svg'
import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'
import { toast } from 'react-toastify'

interface Notification {
  $id: string
  type: string
  description: string
  time_event: string
  id_device: string
  is_alert_on: boolean
}

interface OccurrencesMapProps {
  width?: number
  height?: number
  defaultCenter?: [number, number]
  defaultZoom?: number
  occurences?: OccurrencesProps[]
  notifications?: Notification[]
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>
  selectedLocation?: [number, number]
}

export function OccurrencesMap({
  width,
  height,
  defaultCenter = [-7.1509317, -34.8446769],
  defaultZoom = 11,
  occurences,
  notifications,
  setNotifications,
  selectedLocation,
}: OccurrencesMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [occurence, setOccurence] = useState<OccurrencesProps>({} as OccurrencesProps)
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false)
  const [localOccurrences, setLocalOccurrences] = useState<OccurrencesProps[]>(occurences || [])
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [zoom, setZoom] = useState(defaultZoom)
  
  // Navegação entre ocorrências na mesma localização
  const [sameLocationOccurrences, setSameLocationOccurrences] = useState<OccurrencesProps[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const pathname = usePathname().slice(1)
  const isFullScreen = pathname === 'map/ocorrencias'

  // Atualiza o centro do mapa e abre o popup quando uma localização é selecionada
  useEffect(() => {
    if (selectedLocation && occurences) {
      // Encontra todas as ocorrências nesta mesma localização
      const occurrencesAtLocation = occurences.filter(
        occ => occ.event?.last_location?.[0] === selectedLocation[0] && 
              occ.event?.last_location?.[1] === selectedLocation[1]
      )

      if (occurrencesAtLocation.length > 0) {
        setCenter(selectedLocation)
        setZoom(15)
        setSameLocationOccurrences(occurrencesAtLocation)
        setCurrentIndex(0)
        setOccurence(occurrencesAtLocation[0])
        isFullScreen ? setIsOverlayOpen(true) : setIsInfoCardOpen(true)
      }
    }
  }, [selectedLocation, occurences, isFullScreen])

  // Atualiza os dados iniciais quando as props mudarem
  useEffect(() => {
    if (occurences) {
      setLocalOccurrences(occurences)
    }
  }, [occurences])

  function handleOpenPopup(event: OccurrencesProps) {
    // Encontra todas as ocorrências nesta mesma localização
    if (!event.event?.last_location) return
    
    const occurrencesAtLocation = localOccurrences.filter(
      occ => occ.event?.last_location && 
            occ.event.last_location[0] === event.event.last_location[0] && 
            occ.event.last_location[1] === event.event.last_location[1]
    )
    
    setSameLocationOccurrences(occurrencesAtLocation)
    setCurrentIndex(occurrencesAtLocation.indexOf(event))
    setOccurence(event)
    isFullScreen ? setIsOverlayOpen(true) : setIsInfoCardOpen(true)
  }

  function closePopup() {
    setIsInfoCardOpen(false)
    setIsOverlayOpen(false)
    setSameLocationOccurrences([])
  }
  
  function nextOccurrence() {
    if (sameLocationOccurrences.length <= 1) return
    const nextIndex = (currentIndex + 1) % sameLocationOccurrences.length
    setCurrentIndex(nextIndex)
    setOccurence(sameLocationOccurrences[nextIndex])
  }
  
  function prevOccurrence() {
    if (sameLocationOccurrences.length <= 1) return
    const prevIndex = (currentIndex - 1 + sameLocationOccurrences.length) % sameLocationOccurrences.length
    setCurrentIndex(prevIndex)
    setOccurence(sameLocationOccurrences[prevIndex])
  }

  const size = useWindowSize()

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    })

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener('resize', handleResize)

      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
  }

  function setWidth() {
    if (isFullScreen) {
      return window.innerWidth
    }
  }

  function setHeight() {
    if (isFullScreen) {
      return window.innerHeight
    }

    if (size.width >= 1024) {
      return 400
    }

    return 340
  }

  function getIcon(type: string) {
    if (type === 'Furto' || type === 'Furto simples' || type === 'Roubo') {
      return (
        <Image
          src={steal}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          alt="furto"
          className="w-12 h-12 relative top-2 left-4"
        />
      )
    } else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return (
        <Image
          src={interrogation}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          alt="perda"
          className="w-10 h-10 relative top-2.5 left-4"
        />
      )
    }
  }

  function getColor(type: string) {
    if (type === 'Furto' || type === 'Furto simples') {
      return '#f97316'
    } else if (type === 'Roubo') {
      return '#EF4444'
    } else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return '#EAB308'
    }
  }

  return (
    <>
      <Map
        onClick={() => closePopup()}
        width={setWidth()}
        height={setHeight()}
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center)
          setZoom(zoom)
        }}
      >
        {localOccurrences &&
          localOccurrences.map(
            (occurence, index) =>
              occurence.event?.last_location && (
                <Marker
                  key={index}
                  width={50}
                  anchor={occurence.event?.last_location}
                  color={getColor(occurence.event?.type)}
                  onClick={() => handleOpenPopup(occurence)}
                />
              )
          )}
        {isOverlayOpen && occurence.event?.last_location && (
          <Overlay anchor={occurence.event?.last_location} offset={[0, 0]}>
            <div className="flex flex-col relative -translate-x-1/2 rounded-lg ring-1 ring-procura-ai-blue bg-white px-4 py-2">
              <Triangle className="text-white absolute fill-white -top-3 left-[46%]" />
              
              {/* Adiciona navegação entre ocorrências na mesma localização */}
              {sameLocationOccurrences.length > 1 && (
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      prevOccurrence();
                    }} 
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm font-medium">
                    {currentIndex + 1} de {sameLocationOccurrences.length}
                  </span>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      nextOccurrence();
                    }} 
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <EventDetails
                occurence={occurence}
                closePopup={closePopup}
                styles="w-full ring-0 h-fit"
              />
            </div>
          </Overlay>
        )}
      </Map>
      {isInfoCardOpen && (
        <div className="relative">
          <EventDetails occurence={occurence} closePopup={closePopup} />
          
          {/* Adiciona controles de navegação no card também */}
          {sameLocationOccurrences.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-white px-3 py-1 rounded-full shadow-md">
              <button 
                onClick={prevOccurrence} 
                className="p-1 rounded-full hover:bg-gray-200 mr-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium">
                {currentIndex + 1} de {sameLocationOccurrences.length}
              </span>
              
              <button 
                onClick={nextOccurrence} 
                className="p-1 rounded-full hover:bg-gray-200 ml-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
