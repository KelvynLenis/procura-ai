import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/utils/cn";
import { Tabs } from "expo-router";
import { LogOut, PlusCircle, Smartphone, User } from "lucide-react-native";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import AddDevice from '@/assets/icons/add-device.svg'
import AddDeviceFocused from '@/assets/icons/add-device-focused.svg'
import ContactsIcon from '@/assets/icons/contacts.svg'
import ContactsFocusedIcon from '@/assets/icons/contacts-focused.svg'

const TabIcon = ({ focused, icon, iconFocused, title }: { focused: boolean, icon: any, iconFocused: any, title: string}) => {

  return (
    <View className={cn('w-20 h-20 justify-center items-center', focused && 'rounded-md')}>
      {/* {icon} */}
      {focused ? iconFocused : icon}
      {/* <AddDevice width={20} height={20} className="text-white" /> */}
      <Text className={cn('text-xs text-center', focused ? 'text-procura-ai-blue' : 'text-black')}>{title}</Text>
      {focused && <View className='w-3/5 h-0.5 bg-procura-ai-blue rounded-full' />}
    </View>
  )
}

export default function LoggedLayout() {
   return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarItemStyle: {
            width: '10%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            marginLeft: 15,
            marginTop: 15
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            borderRadius: 0,
            marginHorizontal: 0,
            marginBottom: 0,
            height: 70,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignContent: 'flex-end',
            alignItems: 'center',
            // paddingTop: 15,
            position: 'fixed',
            overflow: 'hidden',
          }
        }}
      >
        <Tabs.Screen 
          name="my-devices/index" 
          options={{ headerShown: true, title: 'Meus dispositivos', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<Smartphone size={20}  color={"black"} />} iconFocused={<Smartphone size={20}  color={"#002E72"} />} title="Meus dispositivos" />
              </>
            )
          }} 
        />

        <Tabs.Screen 
          name="add-new" 
          options={{ headerShown: true, title: 'Adicionar novo', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<AddDevice width={20} height={20} className="text-white" />} iconFocused={<AddDeviceFocused width={20} height={20} />} title="Adicionar novo" />
              </>
            )
          }} 
        />
        <Tabs.Screen 
          name="contacts" 
          options={{ headerShown: true, title: 'Contatos de confiança', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<ContactsIcon width={20} height={20} />} iconFocused={<ContactsFocusedIcon width={20} height={20} />} title="Contatos de confiança" />
              </>
            )
          }} 
        />

        <Tabs.Screen 
          name="profile" 
          options={{ headerShown: true, title: 'Perfil', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<User size={20} color={"black"} />} iconFocused={<User size={20} color={"#002E72"} />} title="Perfil" />
              </>
            )
          }} 
        />   
      </Tabs>

    </ProtectedRoute>
  )
}
