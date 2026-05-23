// aplicativo/app/index.tsx
import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.',
  'Erro ao buscar detalhes do filme:',
]);

export default function Index() {
  return <Redirect href="/telas/Login" />;
}
