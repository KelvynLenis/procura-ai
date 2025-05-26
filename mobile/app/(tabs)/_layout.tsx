import ProtectedRoute from "@/components/ProtectedRoute";
import { cn } from "@/utils/cn";
import { Tabs } from "expo-router";
import { Contact, LogOut, PlusCircle, Smartphone, User } from "lucide-react-native";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";

const TabIcon = ({ focused, icon, title }: { focused: boolean, icon: any, title: string}) => {

  return (
    <View className={cn('w-20 h-20 justify-center items-center', focused && 'rounded-md')}>
      {icon}
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
          name="my-devices" 
          options={{ headerShown: true, title: 'Meus dispositivos', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<Smartphone size={20} color={focused ? "#002E72" : "black"} />} title="Meus dispositivos" />
              </>
            )
          }} 
        />

        <Tabs.Screen 
          name="add-new" 
          options={{ headerShown: true, title: 'Adicionar novo', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<PlusCircle size={20} color={focused ? "#002E72" : "black"} />} title="Adicionar novo" />
              </>
            )
          }} 
        />
        <Tabs.Screen 
          name="contacts" 
          options={{ headerShown: true, title: 'Contatos de confiança', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<Contact size={20} color={focused ? "#002E72" : "black"} />} title="Contatos de confiança" />
              </>
            )
          }} 
        />

        <Tabs.Screen 
          name="profile" 
          options={{ headerShown: true, title: 'Perfil', tabBarIcon: ({ focused }) => (
              <>
                <TabIcon focused={focused} icon={<User size={20} color={focused ? "#002E72" : "black"} />} title="Perfil" />
              </>
            )
          }} 
        />      
      </Tabs>
    </ProtectedRoute>
  )
}
