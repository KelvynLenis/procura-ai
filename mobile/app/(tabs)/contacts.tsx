import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'
import { Pencil, Trash2 } from 'lucide-react-native'
import Button from '@/components/Button'
import ContactForm from '@/components/Forms/ContactForm'
import ConfirmationDialog from '@/components/ConfirmationDialog'

const Card = () => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  return (
    <>
      <View className='bg-white w-[95%] flex rounded-2xl' style={{ height: 160 }}>
        <View className='w-full h-16 flex flex-row items-center justify-end gap-3 px-5 bg-primary rounded-t-2xl'>
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
          <Pencil size={24} color='black' />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsConfirmModalVisible(true)} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
          <Trash2 size={24} color='red' />
        </TouchableOpacity>
        </View>
        <View style={{ height: 105, borderBottomEndRadius: 20, borderBottomStartRadius: 20, borderColor: 'rgba(35, 35, 35, 0.5)', borderWidth: 1 }} className='flex flex-row w-full border'>
          <View style={{ paddingLeft: 20 }} className='flex items-start gap-2 pt-4 w-[25%] h-full'>
            <Text>Nome</Text>
            <Text>E-mail</Text>
            <Text>Contato</Text>
          </View>
          <View className='flex items-start px-6 gap-2 pt-4 w-full h-full'>
            <Text className='font-semibold'>Nome</Text>
            <Text className='font-semibold'>email@mail.com</Text>
            <Text className='font-semibold'>(83) 99999-9999</Text>                
          </View>
        </View>
      </View>

      <Modal animationType='fade' transparent visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '48%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <ContactForm setIsModalVisible={setIsEditModalVisible} />
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmationDialog className='h-40' isModalVisible={isConfirmModalVisible} setIsModalVisible={setIsConfirmModalVisible} title='Excluir contato' description='Tem certeza que deseja excluir esse contato?' />
    </>
  )
}

export default function Contacts() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Contatos de confiança" />
          ),
        }}
      />
      <View className='w-screen h-screen bg-[#F2F8FD] p-2 gap-2'>
        <Card />

        <Button onPress={() => setIsAddModalVisible(true)} variant='blue' className='w-52 self-end'>Adicionar contato</Button>
      </View>

      <Modal animationType='fade' transparent visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsAddModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '48%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <ContactForm setIsModalVisible={setIsAddModalVisible} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}