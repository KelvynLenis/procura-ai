import { View, Text } from 'react-native'
import React from 'react'
import { DeviceProps } from '@/interfaces'

interface ViewMyAlertsProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
  device: DeviceProps
}

const ViewMyAlerts = ({ setIsModalVisible, device }: ViewMyAlertsProps) => {
  return (
    <View>
      <Text>ViewMyAlerts</Text>
    </View>
  )
}

export default ViewMyAlerts