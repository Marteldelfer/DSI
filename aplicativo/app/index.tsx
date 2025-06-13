// aplicativo/app/index.tsx
import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import TelaLogin from "./telas/Login"; // Caminho de importação correto

export default function Index() {
  return (
    <TelaLogin></TelaLogin>
  );
}