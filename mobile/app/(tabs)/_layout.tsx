import { cn } from "@/utils/cn";
import { Tabs } from "expo-router";
import { Contact, LogOut, PlusCircle, Smartphone, User } from "lucide-react-native";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";

const TabIcon = ({ focused, icon, title }: { focused: boolean, icon: any, title: string}) => {

  return (
    <View className={cn('w-28 h-20 justify-center items-center', focused && 'bg-zinc-200 rounded-md')}>
      {icon}
      {focused && (
        <Text className={cn('text-xs', focused ? 'text-black' : 'text-black')}>{title}</Text>
      )}
    </View>
  )
}

export default function LoggedLayout() {
   return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderRadius: 0,
          marginHorizontal: 0,
          marginBottom: 0,
          height: 70,
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          paddingTop: 15,
          position: 'fixed',
          overflow: 'hidden',
        }
      }}
    >
      <Tabs.Screen 
        name="my-devices" 
        options={{ headerShown: true, title: 'Meus dispositivos', tabBarIcon: ({ focused }) => (
            <>
              <TabIcon focused={focused} icon={<Smartphone size={20} color="black" />} title="Meus dispositivos" />
            </>
          )
        }} 
      />

      <Tabs.Screen 
        name="add-new" 
        options={{ headerShown: true, title: 'Adicionar novo', tabBarIcon: ({ focused }) => (
            <>
              <TabIcon focused={focused} icon={<PlusCircle size={20} color="black" />} title="Adicionar novo" />
            </>
          )
        }} 
      />
      <Tabs.Screen 
        name="contacts" 
        options={{ headerShown: true, title: 'Contatos de confiança', tabBarIcon: ({ focused }) => (
            <>
              <TabIcon focused={focused} icon={<Contact size={20} color="black" />} title="Contatos de confiança" />
            </>
          )
        }} 
      />

      <Tabs.Screen 
        name="profile" 
        options={{ headerShown: true, title: 'Perfil', tabBarIcon: ({ focused }) => (
            <>
              <TabIcon focused={focused} icon={<User size={20} color="black" />} title="Perfil" />
            </>
          )
        }} 
      />      
    </Tabs>
  )
}
