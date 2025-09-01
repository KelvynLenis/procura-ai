'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { NotificationProps, OccurrencesProps } from '@/interfaces'
// import { joinDevicesEventsUsers } from '@/functions/occurences/get-occurrences'
import { account, client } from '@/lib/appwrite'
import { listUserDevices } from '@/functions/device/list-user-devices'

interface NotificationContextType {
  notifications: NotificationProps[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationProps[]>>
  selectedLocation: [number, number] | undefined
  setSelectedLocation: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
  selectedOccurrence: OccurrencesProps | undefined
  setSelectedOccurrence: React.Dispatch<React.SetStateAction<OccurrencesProps | undefined>>
  occurrences: OccurrencesProps[]
  setOccurrences: React.Dispatch<React.SetStateAction<OccurrencesProps[]>>
  handleNotificationClick: (notification: NotificationProps, occurrences?: OccurrencesProps[]) => void
  refreshOccurrences: () => Promise<void>
  clearSelection: () => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function NotificationProvider({ children, isAdmin }: { children: ReactNode, isAdmin?: boolean }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>()
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrencesProps | undefined>()
  const [occurrences, setOccurrences] = useState<OccurrencesProps[]>([])
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const debouncedUpdateTrigger = useDebounce(updateTrigger, 500)

  const refreshOccurrences = useCallback(async () => {
    // if (!isAdmin) return // Só buscar ocorrências para admins
    
    try {
      // console.log('Contexto: Buscando ocorrências...')
      // const data = await joinDevicesEventsUsers()
      // setOccurrences(data || [])
      // console.log('Contexto: Ocorrências atualizadas', data?.length || 0)
    } catch (error) {
      console.error('Erro ao atualizar ocorrências:', error)
    }
  }, [isAdmin])

  useEffect(() => {
    
    const handleNewNotification = async (response: any) => {
      const { payload } = response
      const relevantTypes = !isAdmin ? ['Recuperado'] : [
        'Furto simples',
        'Extravio ou Perda', 
        'Roubo',
        'Recuperado',
        'Regular'
      ]

      if (relevantTypes.includes(payload.type)) {

        if (!isAdmin) {
          const idDevice = payload.id_device

          const userAuth = await account.get()
          const userDevices = await listUserDevices(userAuth.$id)

          if (!userDevices.some(device => device.$id === idDevice)) {
            // console.log('Contexto: Ignorando notificação de um dispositivo que o usuário não possui')
            return
          }
        }

        setNotifications(prevNotifications => {
          const exists = prevNotifications.some(n => n.$id === payload.$id)
          if (!exists) {
            // console.log('Contexto: Adicionando nova notificação para admin')
            setUpdateTrigger(prev => prev + 1)
            return [...prevNotifications, payload]
          }
          // console.log('Contexto: Notificação já existe, ignorando')
          return prevNotifications
        })
      }
    }

    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}.documents`,
      handleNewNotification
    )

    return () => {
      // console.log('Contexto: Cancelando subscription do Appwrite...')
      unsubscribe()
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      // console.log('Contexto: Carregando dados iniciais para admin...')
      refreshOccurrences()
    }
  }, [refreshOccurrences, isAdmin])

  useEffect(() => {
    if (debouncedUpdateTrigger > 0 && isAdmin) {
      // console.log('Contexto: Atualizando ocorrências devido a nova notificação...')
      refreshOccurrences()
    }
  }, [debouncedUpdateTrigger, refreshOccurrences, isAdmin])

  const handleNotificationClick = useCallback((notification: NotificationProps, occurrencesList?: OccurrencesProps[]) => {
    if (!isAdmin) return // Só funciona para admins
    
    const currentOccurrences = occurrencesList || occurrences
    
    // console.log('Contexto: Processando clique na notificação', { 
    //   deviceId: notification.id_device,
    //   availableOccurrences: currentOccurrences.length
    // })
    
    const relatedOccurrence = currentOccurrences.find(
      occ => occ.device.$id === notification.id_device
    )

    if (relatedOccurrence?.event?.last_location) {
      // console.log('Contexto: Ocorrência encontrada', { 
      //   deviceId: notification.id_device, 
      //   location: relatedOccurrence.event.last_location,
      //   eventType: relatedOccurrence.event.type
      // })
      
      setSelectedOccurrence(relatedOccurrence)
      
      setSelectedLocation(undefined)
      
      requestAnimationFrame(() => {
        setSelectedLocation(relatedOccurrence.event.last_location)
        // console.log('Contexto: Localização definida', relatedOccurrence.event.last_location)
      })
    } else {
      console.warn('Contexto: Ocorrência não encontrada ou sem localização', {
        deviceId: notification.id_device,
        found: !!relatedOccurrence,
        hasLocation: !!relatedOccurrence?.event?.last_location
      })
    }
  }, [occurrences, isAdmin])

  const clearSelection = useCallback(() => {
    // console.log('Contexto: Limpando seleção')
    setSelectedLocation(undefined)
    setSelectedOccurrence(undefined)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      selectedLocation,
      setSelectedLocation,
      selectedOccurrence,
      setSelectedOccurrence,
      occurrences,
      setOccurrences,
      handleNotificationClick,
      refreshOccurrences,
      clearSelection
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
