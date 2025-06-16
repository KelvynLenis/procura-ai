import { View, Text, FlatList } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'

interface EventTypePickerComponentProps {
  data?: { label: string, value: string }[] 
  value?: string
  setValue: (value: string) => void
}

const EventTypePickerComponent = ({ value, data, setValue }: EventTypePickerComponentProps) => {
  const [selectedValue, setSelectedValue] = useState(value ? value : '');

  function onSelect(value: string) {
    setSelectedValue(value)
    setValue(value)
  }

  return (
    <View className='flex-1 w-full'>
      <View className='flex flex-row gap-1'>
        <Text style={{ color: 'red' }}>*</Text>
        <Text className='text-lg mb-3 w-48 font-medium'>Tipo de ocorrência</Text>
      </View>
      
      <Picker
        selectedValue={selectedValue}
        className='bg-zinc-200'
        style={{ width: '100%', backgroundColor: '#f4f4f5' }}
        onValueChange={(itemValue, itemIndex) =>
          onSelect(itemValue)
        }>
          <Picker.Item label='Selecione o tipo de ocorrência' value='' />
          <Picker.Item label='Roubo' value='Roubo' />    
          <Picker.Item label='Extravio ou Perda' value='Extravio ou Perda' />    
          <Picker.Item label='Furto' value='Furto simples' />    
      </Picker>
    </View>
  )
}

export default EventTypePickerComponent