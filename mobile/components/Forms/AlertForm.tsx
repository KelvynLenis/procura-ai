import { View, Text, ScrollView, TextInput, Keyboard, FlatList, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import InputField from '../InputField'
import Button from '../Button';
import { isPointInPolygon } from 'geolib';
import bairros from '../../assets/data/bairros.json';
import paraibaGeoJSON from '../../assets/data/Paraiba.json';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { createEvent } from '@/functions/event/create-event';
import { DeviceProps } from '@/interfaces';
import { updateDeviceStatus } from '@/functions/device/update-device-status';
import { router } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { cn } from '@/utils/cn';
import { formatISODateString } from '@/lib/utils';
import EventTypePickerComponent from '../EventTypePickerComponent';
import * as turf from '@turf/turf';
import { updateDistrictCounters } from '@/functions/districts/update-district-counters';
import { getNeighborhoodId } from '@/functions/districts/get-neighborhood-id';
import { getNeighborhood } from '@/functions/districts/get-neighborhood';
import { updateDistrict } from '@/functions/districts/update-district';

interface AlertFormProps {
  device: DeviceProps
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  onSuccess?: () => void
}

interface formProps {
  datetime: string,
  description: string,
  type: string,
  location: [number, number]
  id_district: string
}

interface FormErrors {
  datetime?: string;
  type?: string;
  location?: string;
}

const PARAIBA_CENTER = {
  latitude: -7.1195,
  longitude: -34.8450,
};

const AlertForm = ({ setIsModalVisible, device, onSuccess }: AlertFormProps) => {
  const [form, setForm] = useState<formProps>({
    datetime: "",
    description: "",
    type: "",
    location: [0, 0],
    id_district: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [search, setSearch] = useState('');
  const [dateTime, setDateTime] = useState('')
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const [idDistrict, setIdDistrict] = useState('');

  // let id_district = '';

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const getBairroFromCoordinate = (latitude: number, longitude: number): string | null => {
    const point = turf.point([longitude, latitude]);

    for (const feature of bairros.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return feature.properties.cod_bairro; // ou outro campo como 'id'
      }
    }

    return null;
  };


  const handleConfirm = (date: Date) => {
    setForm({ ...form, datetime: date.toISOString() });
    setDateTime(date.toISOString());
    hideDatePicker();
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;

    const cod_neighborhood = getBairroFromCoordinate(coordinate.latitude, coordinate.longitude);

    if (cod_neighborhood) {
      const neighborhoodId = await getNeighborhoodId(Number(cod_neighborhood));


      if (neighborhoodId) {
        // id_district = neighborhoodId
        setIdDistrict(neighborhoodId)
        setForm({ ...form, id_district: neighborhoodId });
      }
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        alert('Não foi possível identificar o local.');
        return;
      }

      const result = data.results[0];

      // Verifica se o local está na Paraíba
      const isParaiba = result.formatted_address.includes('Paraíba') ||
                        result.address_components?.some((comp: any) =>
                          comp.long_name === 'Paraíba' || comp.short_name === 'PB'
                        );

      if (!isParaiba) {
        alert('O local selecionado não está na Paraíba.');
        return;
      }

      setMarker(coordinate);
      setForm({ ...form, location: [coordinate.latitude, coordinate.longitude] });

    } catch (error) {
      console.error('Erro ao verificar local:', error.message);
      alert('Erro ao verificar localização selecionada.');
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const fullQuery = `${search}, Paraíba, Brasil`; // Força busca na PB

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullQuery)}&components=country:BR&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        alert('Local não encontrado.');
        return;
      }

      const result = data.results[0];

      // Verifica se a resposta contém "Paraíba" ou "PB"
      const isParaiba = result.formatted_address.includes('Paraíba') ||
                        result.address_components?.some((comp: any) =>
                          comp.long_name === 'Paraíba' || comp.short_name === 'PB'
                        );

      if (!isParaiba) {
        alert('O local encontrado não está na Paraíba.');
        return;
      }

      const location = result.geometry.location;

      const newRegion = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMarker({ latitude: location.lat, longitude: location.lng });
      setForm({ ...form, location: [location.lat, location.lng] });
      mapRef.current?.animateToRegion(newRegion, 1000);
      Keyboard.dismiss();

    } catch (error) {
      console.error('Erro na geocodificação:', error);
      alert('Erro ao buscar localização.');
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearch(text);

    if (text.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}&components=country:br&location=${PARAIBA_CENTER.latitude},${PARAIBA_CENTER.longitude}&radius=250000`
      );
      const json = await res.json();

      if (json.status === 'OK') {
        // Filtra apenas sugestões com "PB" ou "Paraíba"
        const paraibaResults = json.predictions.filter((prediction: any) =>
          /PB|Paraíba/i.test(prediction.description)
        );
        setPredictions(paraibaResults);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Erro no autocomplete:', err);
    }
  };

  const handlePredictionSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`
      );
      const json = await res.json();
      const location = json.result.geometry.location;

      const region = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMarker({ latitude: location.lat, longitude: location.lng });
      setForm({ ...form, location: [location.lat, location.lng] });
      mapRef.current?.animateToRegion(region, 1000);
      setSearch(description);
      setPredictions([]);
      Keyboard.dismiss();
    } catch (err) {
      console.error('Erro ao buscar detalhes do local:', err);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!dateTime) {
      newErrors.datetime = 'Data e hora são obrigatórios';
      isValid = false;
    }

    if (!form.type) {
      newErrors.type = 'Tipo de ocorrência é obrigatório';
      isValid = false;
    }

    if (!marker) {
      newErrors.location = 'Localização é obrigatória';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function onSubmit(){
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const data = { 
        id_device: device.$id,  
        description: form.description,
        time_event: dateTime,
        type: form.type,
        last_location: form.location,
        is_alert_on: true,
        id_district: idDistrict
      }

      await createEvent(data);

      await updateDeviceStatus(device.$id!, {
        is_stolen: true,
        status: form.type,
      })

      if (idDistrict) {
        const neighborhood = await getNeighborhood(idDistrict)
        
        let data_neighborhood = {}

        if (form.type === 'Furto simples') {
          data_neighborhood = {
            theft_counter: neighborhood.theft_counter + 1,
          }
        } else if (form.type === 'Extravio ou Perda') {
          data_neighborhood = {
            lost_counter: neighborhood.lost_counter + 1,
          }
        } else if (form.type === 'Roubo') {
          data_neighborhood = {
            robbery_counter: neighborhood.robbery_counter + 1,
          }
        }

        if (Object.keys(data).length > 0) {
          await updateDistrict(idDistrict, data_neighborhood)
        }
      }

      setForm({
        datetime: "",
        description: "",
        type: "",
        location: [0, 0],
        id_district: ""
      });
      setDateTime('');
      setMarker(null);
      setErrors({});

      setIsModalVisible(false);
      Alert.alert('Sucesso', 'Alerta criado com sucesso!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 24, gap: 20 }}>
        {/* <View className='flex-col h-full flex-1 items-start p-6 gap-5 bg-transparent shadow-black shadow-md rounded-xl w-full'> */}
          <Text className='font-medium'>Preencha as informações:</Text>
          <View className='w-full h-0.5 bg-zinc-200' />

          <View className='gap-2 w-full'>
            <Text className='font-medium'>
              <Text className='text-red-500'>*</Text>
              Data e hora da ocorrência
            </Text>
            <TouchableOpacity onPress={showDatePicker} className='w-full flex p-2 rounded-lg flex-row items-center gap-2 h-10 bg-zinc-100'>
              <Text className={cn(dateTime ? 'text-zinc-900' : 'text-zinc-500')}>{dateTime ? formatISODateString(dateTime) : 'Ex.: 02/06/2025 - 12:00'}</Text>
            </TouchableOpacity>
            {errors.datetime && (
              <Text className='text-red-500 text-sm'>{errors.datetime}</Text>
            )}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </View>

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

          <View className='gap-2 w-full'>
            <EventTypePickerComponent 
              value={form.type} 
              setValue={(value) => {
                setForm({ ...form, type: value });
                setErrors(prev => ({ ...prev, type: undefined }));
              }}
            />
            {errors.type && (
              <Text className='text-red-500 text-sm'>{errors.type}</Text>
            )}
          </View>

          <View className='flex flex-col w-full gap-1'>
            <View className='flex flex-row gap-2'>
              <Text className='font-medium'>
                <Text className='text-red-500'>*</Text>
                Clique no mapa para selecionar o local aproximado da ocorrência
              </Text>
            </View>
            {errors.location && (
              <Text className='text-red-500 text-sm'>{errors.location}</Text>
            )}
            <View className='w-full h-80 gap-2'>
              <View className='relative'>
                <View className='flex flex-row gap-2'>
                  <TextInput
                    className='flex-1 rounded-md border-0 p-4 bg-zinc-100 max-h-16'
                    placeholder="Ex.: Shopping Center, Avenida Floriano, 1234 ou 12345-678"
                    value={search}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  <Button className='rounded-md' variant='blue' onPress={handleSearch}>
                    Buscar
                  </Button>
                </View>

                {predictions.length > 0 && (
                  <View className='absolute top-14 left-0 right-0 bg-white shadow-md rounded-md z-10 max-h-60'>
                    <FlatList
                      data={predictions}
                      keyExtractor={(item) => item.place_id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className='p-3 border-b border-zinc-200'
                          onPress={() => handlePredictionSelect(item.place_id, item.description)}
                        >
                          <Text className='text-sm text-zinc-800'>{item.description}</Text>
                        </TouchableOpacity>
                      )}
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                )}
              </View>

              <MapView
                initialRegion={{
                  latitude: -7.1195,
                  longitude: -34.8450,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={handleMapPress}
                style={{ flex: 1 }}
              >
                {marker && <Marker coordinate={marker} />}
              </MapView>
            </View>
          </View>

          <View className='flex flex-row w-full' style={{ justifyContent: 'space-between' }}>
            <Button variant='white' onPress={setIsModalVisible ? () => setIsModalVisible(false) : () => console.log('cancelar')}>
              Cancelar
            </Button>
            <Button variant='blue' onPress={onSubmit}>
              {isLoading ? 'Criando...' : 'Criar alerta'}
            </Button>
          </View>
        {/* </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AlertForm