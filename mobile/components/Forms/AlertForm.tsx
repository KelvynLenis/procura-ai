import { View, Text, ScrollView, TextInput, Keyboard, FlatList, TouchableOpacity, Alert, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { isPointInPolygon } from 'geolib';
import paraibaGeoJSON from '../../assets/data/Paraiba.json';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { createEvent } from '@/functions/event/create-event';
import { DeviceProps } from '@/interfaces';
import { updateDeviceStatus } from '@/functions/device/update-device-status';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
// import DatePicker from 'react-native-date-picker'

const PARAIBA_CENTER = {
  latitude: -7.5,
  longitude: -36.5,
};

const PARAIBA_BOUNDS = {
  minLat: -8.5,
  maxLat: -5.5,
  minLng: -39.0,
  maxLng: -34.0,
};

interface AlertFormProps {
  setIsModalVisible?: React.Dispatch<React.SetStateAction<boolean>>
  device: DeviceProps
}

const AlertForm = ({ setIsModalVisible, device }: AlertFormProps) => {
  const [form, setForm] = useState({
    datetime: "",
    description: "",
    type: "",
    location: [0, 0],
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  // const [predictions, setPredictions] = useState<any[]>([]);
  const mapRef = useRef<MapView | null>(null);
  const [open, setOpen] = useState(false)

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(false); // fecha o picker
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setMarker(coordinate);
    setForm({ ...form, location: [coordinate.latitude, coordinate.longitude] });
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(search)}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
      );
      const data = await response.json();

      const point = {
        latitude: data.results[0].geometry.location.lat,
        longitude: data.results[0].geometry.location.lng
      }

      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;

        const newRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setMarker({ latitude: location.lat, longitude: location.lng });
        setForm({ ...form, location: [point.latitude, point.longitude] });
        mapRef.current?.animateToRegion(newRegion, 1000);
        Keyboard.dismiss();
      } else {
        alert('Local não encontrado.');
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      alert('Erro ao buscar localização.');
    }
  };

  // const handleSearchChange = async (text: string) => {
  //   setSearch(text);
  //   if (text.length < 3) {
  //     setPredictions([]);
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
  //         text
  //       )}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}&components=country:br&location=${PARAIBA_CENTER.latitude},${PARAIBA_CENTER.longitude}&radius=250000`
  //     );
  //     const json = await res.json();
  //     if (json.status === 'OK') {
  //       setPredictions(json.predictions);
  //     } else {
  //       setPredictions([]);
  //     }
  //   } catch (err) {
  //     console.error('Erro no autocomplete:', err);
  //   }
  // };

  // const handlePredictionSelect = async (placeId: string, description: string) => {
  //   try {
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
  //     );
  //     const json = await res.json();
  //     const location = json.result.geometry.location;

  //     const region = {
  //       latitude: location.lat,
  //       longitude: location.lng,
  //       latitudeDelta: 0.01,
  //       longitudeDelta: 0.01,
  //     };

  //     setMarker({ latitude: location.lat, longitude: location.lng });
  //     mapRef.current?.animateToRegion(region, 1000);
  //     setSearch(description);
  //     setPredictions([]);
  //     Keyboard.dismiss();
  //   } catch (err) {
  //     console.error('Erro ao buscar detalhes do local:', err);
  //   }
  // };

  // const keepWithinParaiba = (region: Region) => {
  //   const { latitude, longitude } = region;

  //   const clampedLat = Math.max(PARAIBA_BOUNDS.minLat, Math.min(PARAIBA_BOUNDS.maxLat, latitude));
  //   const clampedLng = Math.max(PARAIBA_BOUNDS.minLng, Math.min(PARAIBA_BOUNDS.maxLng, longitude));

  //   if (latitude !== clampedLat || longitude !== clampedLng) {
  //     mapRef.current?.animateToRegion({
  //       latitude: clampedLat,
  //       longitude: clampedLng,
  //       latitudeDelta: region.latitudeDelta,
  //       longitudeDelta: region.longitudeDelta,
  //     }, 500);
  //   }
  // };

  async function onSubmit(){
    try {
      const data = { 
        id_device: device.$id,  
        description: form.description,
        time_event: form.datetime,
        type: form.type,
        last_location: form.location,
        is_alert_on: true,
        id_district: ""
      }

      await createEvent(data);

      await updateDeviceStatus(device.$id!, {
        is_stolen: true,
        status: form.type,
      })

      setForm({
        datetime: "",
        description: "",
        type: "",
        location: [0, 0]
      })

      router.push('/my-devices')
      Alert.alert('Alerta enviado com sucesso!');
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%' }}>
      <View className='flex-col items-start p-6 gap-5 bg-white shadow-black shadow-md rounded-xl w-full'>
        <Text className='font-medium'>Preencha as informações:</Text>
        <View className='w-full h-0.5 bg-zinc-200' />

        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={onChange}
          
        />

        {/* <InputField
          label="Data e hora da ocorrência"
          required
          labelStyle='font-medium'
          placeholder="02/06/2024 - 12:00"
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="birthdate"
          value={form.datetime}
          onChangeText={(value) => setForm({ ...form, datetime: value })}
        /> */}


        <InputField
          label="Descrição"
          labelStyle='font-medium'
          maxLength={250}
          numberOfLines={4}
          placeholder="Descreva em poucas palavras como aconteceu."
          containerStyle='rounded-md items-start border-0 bg-zinc-100 w-full h-40'
          inputStyle='h-40 break-words rounded-md'
          textContentType="none"
          value={form.description}
          onChangeText={(value) => setForm({ ...form, description: value })}
        />

        <InputField
          label="Tipo de ocorrência"
          labelStyle='font-medium'
          required
          placeholder="tipo"
          containerStyle='rounded-md border-0 bg-zinc-100 w-full'
          textContentType="none"
          value={form.type}
          onChangeText={(value) => setForm({ ...form, type: value })}
        />
        
        <View className='flex flex-col w-full gap-1'>
          <View className='flex flex-row gap-2'>
            <Text style={{ color: 'red' }}>*</Text>
            <Text className='font-medium'>
              Clique no mapa para selecionar o local aproximado da  ocorrência ou digite endereço/CEP
            </Text>
          </View>

          <View className='w-full h-80 gap-2'>
            <View className='flex flex-row gap-2'>
              <TextInput
                className='flex-1 rounded-md border-0 p-4 bg-zinc-100 truncate'
                placeholder="Ex.: Shopping Center, Avenida Floriano, 1234 ou 12345-678"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Button className='rounded-md' variant='blue' onPress={handleSearch}>
                Buscar
              </Button>
            </View>
              <MapView 
              initialRegion={{
                latitude: -7.1195,
                longitude: -34.8450,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onPress={handleMapPress} style={{ flex: 1 }} 
            >
              {marker && <Marker coordinate={marker} />}
            </MapView>
          </View>
        </View>

        <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
          <Button variant='blue'>
            Criar conta
          </Button>
          <Button variant='red' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
            Cancelar
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
export default AlertForm