import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="telas/Cadastro.tsx" options={{ headerShown: false }} />
    </Stack>
  );
}
