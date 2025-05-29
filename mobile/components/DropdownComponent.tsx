import { View, Text } from 'react-native'
import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker';

const DropdownComponent = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Vivo', value: 'cf999525-434b-48b4-8a4b-15d350a04778' },
    { label: 'Algar', value: 'cc66c5a1-6596-403e-8121-041237b95c3a' },
    { label: 'Datora', value: 'b3422ef6-e424-4441-be04-1a1a7d3f54ec' },
    { label: 'Surf', value: '30572422-5332-435c-8d4b-d53b4890ae26' },
    { label: 'TIM', value: '2b10b9c9-3bef-4d5e-abc1-15bd81b12789' },
    { label: 'Claro', value: '55202772-4b28-436e-815f-b3adc9335c02' }
  ]);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Selecione uma linguagem"
      />
    </View>
  );
}

export default DropdownComponent