import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import Button from './Button'
import { cn } from '@/utils/cn'

interface ConfirmationDialogProps {
  isModalVisible: boolean
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  description: string
  className?: string
  onConfirm?: () => void
}

const ConfirmationDialog = ({ isModalVisible, setIsModalVisible, title, description, onConfirm, className }: ConfirmationDialogProps) => {

  return (
    <Modal animationType='fade' transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsModalVisible(false)}>
          <Pressable style={{ paddingVertical: 10 }} onPress={(e) => e.stopPropagation()} className={cn('bg-white w-[90%] h-fit p-4 gap-5 flex rounded-2xl overflow-hidden', className)}>
            <Text className='text-xl font-bold'>
              {title}
            </Text>
            <Text className='text-lg'>
              {description}
            </Text>
            <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
              <Button onPress={onConfirm} variant='blue'>Confirmar</Button>
              <Button onPress={() => setIsModalVisible(false)} variant='red'>Cancelar</Button>
            </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default ConfirmationDialog