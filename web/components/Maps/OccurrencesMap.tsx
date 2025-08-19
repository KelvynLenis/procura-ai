'use client'

import React, { useEffect, useState } from 'react'
import { Map, Marker, GeoJson, Overlay, ZoomControl } from 'pigeon-maps'
import type { NotificationProps, OccurrencesProps } from '@/types'
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
  notifications?: NotificationProps[]
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>
  selectedLocation?: [number, number]
  selectedOccurrence?: OccurrencesProps
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
  selectedOccurrence,
}: OccurrencesMapProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [occurence, setOccurence] = useState<OccurrencesProps>({} as OccurrencesProps)
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false)
  const [localOccurrences, setLocalOccurrences] = useState<OccurrencesProps[]>(occurences || [])
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [zoom, setZoom] = useState(defaultZoom)
  
  const [sameLocationOccurrences, setSameLocationOccurrences] = useState<OccurrencesProps[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const pathname = usePathname().slice(1)
  const isFullScreen = pathname === 'map/ocorrencias'

  useEffect(() => {
    if (selectedLocation && occurences) {
      console.log('OccurrencesMap: Recebida nova localização selecionada', selectedLocation)
      
      if (selectedOccurrence && selectedOccurrence.event?.last_location) {
        console.log('OccurrencesMap: Processando ocorrência específica', selectedOccurrence.device.$id)
        
        const occurrencesAtLocation = occurences.filter(
          occ => occ.event?.last_location?.[0] === selectedLocation[0] && 
                occ.event?.last_location?.[1] === selectedLocation[1]
        )

        setCenter(selectedLocation)
        setZoom(15)
        setSameLocationOccurrences(occurrencesAtLocation)
        
        const selectedIndex = occurrencesAtLocation.findIndex(
          occ => occ.device.$id === selectedOccurrence.device.$id
        )
        
        setCurrentIndex(selectedIndex >= 0 ? selectedIndex : 0)
        setOccurence(selectedOccurrence)
        isFullScreen ? setIsOverlayOpen(true) : setIsInfoCardOpen(true)
        
        console.log('OccurrencesMap: Popup aberto para ocorrência específica')
        return
      }

      const occurrencesAtLocation = occurences.filter(
        occ => occ.event?.last_location?.[0] === selectedLocation[0] && 
              occ.event?.last_location?.[1] === selectedLocation[1]
      )

      if (occurrencesAtLocation.length > 0) {
        console.log('OccurrencesMap: Encontradas', occurrencesAtLocation.length, 'ocorrências na localização')
        setCenter(selectedLocation)
        setZoom(15)
        setSameLocationOccurrences(occurrencesAtLocation)
        setCurrentIndex(0)
        setOccurence(occurrencesAtLocation[0])
        isFullScreen ? setIsOverlayOpen(true) : setIsInfoCardOpen(true)
      }
    }
  }, [selectedLocation, selectedOccurrence, occurences, isFullScreen])

  useEffect(() => {
    if (occurences) {
      setLocalOccurrences(occurences)
      console.log('OccurrencesMap: dados atualizados', occurences.length)
    }
  }, [occurences, notifications])

  function getOccurrenceCount(targetLocation: [number, number]): number {
    if (!localOccurrences || localOccurrences.length === 0) return 1
    
    return localOccurrences.filter(
      occ => occ.event?.last_location && 
            occ.event.last_location[0] === targetLocation[0] && 
            occ.event.last_location[1] === targetLocation[1]
    ).length
  }

  function isFirstOccurrenceAtLocation(currentOccurrence: OccurrencesProps, currentIndex: number): boolean {
    if (!currentOccurrence.event?.last_location || !localOccurrences) return false
    
    const targetLocation = currentOccurrence.event.last_location
    
    for (let i = 0; i < currentIndex; i++) {
      const prevOcc = localOccurrences[i]
      if (prevOcc.event?.last_location && 
          prevOcc.event.last_location[0] === targetLocation[0] && 
          prevOcc.event.last_location[1] === targetLocation[1]) {
        return false 
      }
    }
    return true 
  }

  function handleOpenPopup(event: OccurrencesProps) {
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
            (occurence, index) => {
              if (!occurence.event?.last_location) return null
              
              const shouldShowBadge = isFirstOccurrenceAtLocation(occurence, index)
              const count = getOccurrenceCount(occurence.event.last_location)
              
              return (
                <Marker
                  key={`${occurence.event.last_location[0]}-${occurence.event.last_location[1]}-${index}`}
                  width={50}
                  anchor={occurence.event?.last_location}
                  color={getColor(occurence.event?.type)}
                  onClick={() => handleOpenPopup(occurence)}
                >
                  {shouldShowBadge && count > 1 ? (
                    <div 
                      className="bg-white text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-500 shadow-lg"
                      style={{ 
                        position: 'absolute',
                        top: '-7px',
                        right: '-47px',
                        pointerEvents: 'none',
                        zIndex: 999,
                      }}
                    >
                      {count}
                    </div>
                  ) : undefined}
                </Marker>
              )
            }
          )}
        {isOverlayOpen && occurence.event?.last_location && (
          <Overlay anchor={occurence.event?.last_location} offset={[0, 0]}>
            <div className="flex flex-col relative -translate-x-1/2 rounded-lg ring-1 ring-procura-ai-blue bg-white px-4 py-2">
              <Triangle className="text-white absolute fill-white -top-3 left-[46%]" />
              
              <EventDetails
                occurence={occurence}
                closePopup={closePopup}
                styles="w-full ring-0 h-fit"
                sameLocationOccurrences={sameLocationOccurrences}
                currentIndex={currentIndex}
                onNextOccurrence={nextOccurrence}
                onPrevOccurrence={prevOccurrence}
              />
            </div>
          </Overlay>
        )}
      </Map>
      {isInfoCardOpen && (
        <div className="relative">
          <EventDetails 
            occurence={occurence} 
            closePopup={closePopup}
            sameLocationOccurrences={sameLocationOccurrences}
            currentIndex={currentIndex}
            onNextOccurrence={nextOccurrence}
            onPrevOccurrence={prevOccurrence}
          />

        </div>
      )}
    </>
  )
}
