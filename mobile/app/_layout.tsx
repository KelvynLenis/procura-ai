import { Stack } from "expo-router";
import "./global.css"
import { StatusBar } from "react-native";

export default function RootLayout() {
   return (
    <>
      <StatusBar barStyle={"light-content"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
