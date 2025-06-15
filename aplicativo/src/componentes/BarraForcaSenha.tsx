// aplicativo/src/componentes/BarraForcaSenha.tsx
import {
  Text,
  View
} from 'react-native';

import { validarSenha } from "../../src/validacao/Validacao" 

export function BarraForcaSenha({ senha }: { senha: string }): React.JSX.Element {

  const cores = ["#eaeaea", "red", "orange", "yellow", "#7CFC00"];
  const mensages = [
    "Senha Inválida",
    "Senha Fraca",
    "Senha Média",
    "Senha Boa",
    "Senha Forte"
  ];
  const valSenha = validarSenha(senha);

  const forcaSenha = valSenha.tamanhoValido 
                     ? (valSenha.temMaiuscula ? 1 : 0) + 
                       (valSenha.temMinuscula ? 1 : 0) + 
                       (valSenha.temDigito ? 1 : 0) + 
                       (valSenha.temCaractereEspecial ? 1 : 0) 
                     : 0;

  const indiceMensagem = Math.min(forcaSenha, mensages.length - 1);


  return (
    <View style={{
      width: 300,
      marginRight: "auto",
      marginLeft: "auto"
    }}>
      <View style={{
        flexDirection: "row",
        height: 14,
        backgroundColor: "#dbdbdb",
        borderRadius: 5
      }}>
        <View style={{backgroundColor: forcaSenha >= 1 ? cores[1] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha >= 2 ? cores[2] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha >= 3 ? cores[3] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha >= 4 ? cores[4] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
      </View>
      <Text style={{fontSize: 10, textAlign: "right", color: cores[indiceMensagem], fontWeight: "bold"}}>
        {mensages[indiceMensagem]}
      </Text>
    </View>
  );
}