import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="telas/Cadastro.tsx" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Teste.tsx" options={{ headerShown: false }}/>
    </Stack>
  );
}
