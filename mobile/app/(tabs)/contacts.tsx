import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'
import { Pencil, Trash2, Mail, Phone } from 'lucide-react-native'
import Button from '@/components/Button'
import ContactForm from '@/components/Forms/ContactForm'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import { listContacts, type Contact } from '@/functions/contact/list-contacts'
import { deleteContact } from '@/functions/contact/delete-contact'

const formatPhoneNumber = (number: string) => {
  // Remove todos os caracteres não numéricos
  const cleaned = number.replace(/\D/g, '');
  
  // Verifica se é um número válido
  if (cleaned.length !== 11) return number;

  // Formata o número como (XX) XXXXX-XXXX
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
};

const ContactCard = ({ contact, onDelete, onEdit }: { 
  contact: Contact; 
  onDelete: () => void;
  onEdit: () => void;
}) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  return (
    <>
      <View className='bg-white w-full flex rounded-2xl shadow-sm mb-4'>
        <View className='w-full h-16 flex flex-row items-center justify-end gap-3 px-5 bg-primary rounded-t-2xl'>
          <TouchableOpacity onPress={onEdit} className='bg-white border border-zinc-400 flex items-center justify-center w-9 h-9 rounded-md'>
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
            <Text className='font-semibold'>{contact.name_contact || 'Não informado'}</Text>
            <View className="flex-row items-center gap-2">
              <Mail size={16} color="#666" />
              <Text className='font-semibold'>{contact.email_contact || 'Não informado'}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Phone size={16} color="#666" />
              <Text className='font-semibold'>{contact.number_contact ? formatPhoneNumber(contact.number_contact) : 'Não informado'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ConfirmationDialog 
        className='h-56' 
        isModalVisible={isConfirmModalVisible} 
        setIsModalVisible={setIsConfirmModalVisible} 
        title='Excluir contato' 
        description='Tem certeza que deseja excluir esse contato?'
        onConfirm={() => {
          setIsConfirmModalVisible(false);
          onDelete();
        }}
      />
    </>
  )
}

export default function Contacts() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const contactsList = await listContacts({});
      if (contactsList && Array.isArray(contactsList)) {
        setContacts(contactsList);
      } else {
        console.error('Lista de contatos inválida:', contactsList);
        setContacts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os contatos. Tente novamente.');
      setContacts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, []);

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      await loadContacts();
      Alert.alert('Sucesso', 'Contato removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      Alert.alert('Erro', 'Não foi possível remover o contato. Tente novamente.');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F2F8FD]">
        <ActivityIndicator size="large" color="#0F2498" />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <Header title="Contatos de confiança" />
          ),
        }}
      />
      <View className='flex-1 bg-[#F2F8FD] p-4'>
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0F2498"]} // Cor do indicador de loading
              tintColor="#0F2498" // Para iOS
            />
          }
        >
          {contacts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500 text-center">
                Você ainda não tem contatos cadastrados.
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.$id}
                contact={contact}
                onDelete={() => handleDeleteContact(contact.$id)}
                onEdit={() => handleEditContact(contact)}
              />
            ))
          )}

          {contacts.length > 0 && (
            <Text className={`text-center mt-4 mb-4 ${contacts.length >= 3 ? 'text-red-500' : 'text-gray-500'}`}>
              {contacts.length >= 3
                ? 'Você atingiu o limite máximo de contatos cadastrados.'
                : `Você cadastrou ${contacts.length} contatos. Limite máximo de 3 contatos.`}
            </Text>
          )}
        </ScrollView>

        {contacts.length < 3 && (
          <View className="mt-4">
            <Button 
              onPress={() => setIsAddModalVisible(true)} 
              variant='blue' 
              className='w-52 self-end'
            >
              Adicionar contato
            </Button>
          </View>
        )}
      </View>

      <Modal animationType='fade' transparent visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsAddModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '85%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <ContactForm 
              setIsModalVisible={setIsAddModalVisible} 
              onSuccess={loadContacts}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType='fade' transparent visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)}>
        <Pressable className='flex-1 bg-black/50 flex items-center justify-center' onPress={() => setIsEditModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '85%', width: '95%' }} className='bg-white flex rounded-2xl overflow-hidden'>
            <ContactForm 
              initialData={selectedContact!}
              setIsModalVisible={setIsEditModalVisible}
              onSuccess={loadContacts}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}