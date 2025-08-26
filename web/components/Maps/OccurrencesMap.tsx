'use client'

import React, { useEffect, useState } from 'react'
import { Map, Marker, Overlay } from 'pigeon-maps'
import type { NotificationProps, OccurrencesProps } from '@/types'
import { usePathname } from 'next/navigation'
import { EventDetails } from '../EventDetails'
import { Triangle } from 'lucide-react'

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

  function getColor(type: string) {
    if (type === 'Furto' || type === 'Furto simples') {
      return '#f97316'
    } else if (type === 'Roubo') {
      return '#EF4444'
    } else if (type === 'Perda' || type === 'Extravio ou Perda') {
      return '#EAB308'
    }
    return '#3B82F6'
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
        {/* Primeiro: renderizar todos os markers */}
        {localOccurrences &&
          localOccurrences.map(
            (occurence, index) => {
              if (!occurence.event?.last_location) return null
              
              // Se é o primeiro marker dessa localização, usar cor do evento mais recente
              const shouldShowBadge = isFirstOccurrenceAtLocation(occurence, index)
              let markerColor = getColor(occurence.event?.type)
              
              if (shouldShowBadge) {
                // Encontrar o evento mais recente nessa localização
                const occurrencesAtLocation = localOccurrences.filter(
                  occ => occ.event?.last_location && 
                        occ.event.last_location[0] === occurence.event.last_location[0] && 
                        occ.event.last_location[1] === occurence.event.last_location[1]
                )
                
                // Encontrar o evento mais recente (maior timestamp)
                const mostRecentOccurrence = occurrencesAtLocation.reduce((latest, current) => {
                  const latestTime = new Date(latest.event?.time_event || 0).getTime()
                  const currentTime = new Date(current.event?.time_event || 0).getTime()
                  return currentTime > latestTime ? current : latest
                })
                
                markerColor = getColor(mostRecentOccurrence.event?.type)
              }
              
              return (
                <Marker
                  key={`marker-${index}`}
                  width={50}
                  anchor={occurence.event?.last_location}
                  color={markerColor}
                  onClick={() => handleOpenPopup(occurence)}
                />
              )
            }
          )}
        
        {localOccurrences &&
          localOccurrences.map(
            (occurence, index) => {
              if (!occurence.event?.last_location) return null
              
              const shouldShowBadge = isFirstOccurrenceAtLocation(occurence, index)
              const count = getOccurrenceCount(occurence.event.last_location)
              
              if (shouldShowBadge && count > 1) {
                return (
                  <Overlay
                    key={`badge-${index}`}
                    anchor={occurence.event?.last_location}
                    offset={[-4, 55]}
                  >
                    <div 
                      className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-xl"
                      style={{ 
                        pointerEvents: 'none',
                        zIndex: 999999,
                        position: 'relative'
                      }}
                    >
                      {count}
                    </div>
                  </Overlay>
                )
              }
              
              return null
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
