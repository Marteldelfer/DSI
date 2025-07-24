// aplicativo/app/index.tsx
import { Text, View, LogBox } from "react-native";
import { useRouter } from "expo-router";

import TelaLogin from "./telas/Login";

LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component.']);

LogBox.ignoreLogs(['Erro ao buscar detalhes do filme:']); 


export default function Index() {
  return (
    <TelaLogin></TelaLogin>
  );
}