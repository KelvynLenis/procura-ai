import { View, Text, FlatList } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'

interface PickerComponentProps {
  data?: { label: string, value: string }[] 
  value?: string
  setValue: (value: string) => void
}

const PickerComponent = ({ value, data, setValue }: PickerComponentProps) => {
  const [selectedValue, setSelectedValue] = useState(value ? value : '');

  function onSelect(value: string) {
    setSelectedValue(value)
    setValue(value)
  }

  return (
    <View>
      <Text className='text-lg mb-3 w-48'>Operadora</Text>
      
      <Picker
        selectedValue={selectedValue}
        
        onValueChange={(itemValue, itemIndex) =>
          onSelect(itemValue)
        }>
          <Picker.Item label="Nenhuma" value="" />
          <Picker.Item label='Vivo' value='cf999525-434b-48b4-8a4b-15d350a04778' />
          <Picker.Item label='Algar' value='cc66c5a1-6596-403e-8121-041237b95c3a' />
          <Picker.Item label='Datora' value='b3422ef6-e424-4441-be04-1a1a7d3f54ec' />
          <Picker.Item label='Surf' value='30572422-5332-435c-8d4b-d53b4890ae26' />
          <Picker.Item label='TIM' value='2b10b9c9-3bef-4d5e-abc1-15bd81b12789' />
          <Picker.Item label='Claro' value='55202772-4b28-436e-815f-b3adc9335c02' />      
      </Picker>
    </View>
  )
}

export default PickerComponent