import { Stack } from "expo-router";

export default function LoggedLayout() {
   return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)/meus-dispositivos" />
      </Stack>
    </>
  )
}
