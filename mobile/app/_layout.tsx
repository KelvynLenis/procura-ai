import { Stack } from "expo-router";
import "./global.css"
import { StatusBar } from "react-native";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout() {
   return (
    <>

    <NotificationProvider>
        <StatusBar barStyle={"light-content"} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>

    </NotificationProvider>
    </>
  )
}
