import { View, Text, FlatList, Image } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { TouchableOpacity } from 'react-native'
import { images } from '@/contants/images'

interface EventTypePickerComponentProps {
  data?: { label: string, value: string }[] 
  value?: string
  setValue: (value: string) => void
}

const EventTypePickerComponent = ({ value, data, setValue }: EventTypePickerComponentProps) => {
  const [selectedValue, setSelectedValue] = useState(value ? value : '');
  const [isHelpActive, setIsHelpActive] = useState(false)

  function onSelect(value: string) {
    setSelectedValue(value)
    setValue(value)
  }

  return (
    <View className='flex-1 w-full'>
      <View className='flex flex-row w-full items-center justify-between'>
        <View className='flex flex-row gap-1'>
          <Text style={{ color: 'red' }}>*</Text>
          <Text className='text-lg mb-3 w-48 font-medium'>Tipo de ocorrência</Text>
        </View>

        <TouchableOpacity onPress={() => setIsHelpActive(!isHelpActive)}>
          <Image source={images.help} alt='help' className='w-6 h-6' />
        </TouchableOpacity>
      </View>

      {
        isHelpActive && (
          <View className='p-2 rounded-lg w-full flex flex-1 gap-2' style={{ backgroundColor: '#C4F3F2' }}>
            <Text>
              Entenda a diferença entre <Text className='font-semibold'>os tipos de ocorrência</Text>
            </Text>

            <View>
              <Text>
                O <Text className='font-semibold'>furto</Text> ocorre quando há a subtração de coisas alheias móveis, sem o consentimento do proprietário, com o intuito de ficar com elas para si, <Text className='font-semibold underline'>porém sem violência ou grave ameaça</Text>.
              </Text>

              <Text>
                Exemplo: subtrair um telefone celular de uma bolsa enquanto a dona não estava vendo
              </Text>
            </View>

            <View>
              <Text>
                Já o <Text className='font-semibold'>roubo</Text> ocorre com a subtração de coisas alheias móveis <Text className='font-semibold underline'>com a utilização de violência ou grave ameaça contra a pessoa</Text>.
              </Text>

              <Text>
                Exemplo: um indivíduo com a intenção de subtrair um telefone celular, aponta uma arma de fogo contra a vítima e ameaça atirar contra ela caso o aparelho não seja entregue.
              </Text>
            </View>

            <Text>
              Entretanto, o extravio ou perda é caracterizado pelo desaparecimento ou sumiço de algo. 
            </Text>
          </View>
        )
      }
      
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