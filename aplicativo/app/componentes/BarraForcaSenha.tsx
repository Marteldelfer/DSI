import {
  Text,
  View
} from 'react-native';

import { validarSenha } from "../validacao/Validacao"

export function BarraForcaSenha(senha: string): React.JSX.Element {

  const cores = ["#eaeaea", "red", "orange", "yellow", "#7CFC00"];
  const mensages = [
    "Senha Inválida",
    "Senha Fraca",
    "Senha Média",
    "Senha Boa",
    "Senha Forte"
  ];
  const valSenha = validarSenha(senha);
  const forcaSenha = valSenha.tamanhoValido ? Object.values(valSenha).filter((v) => v).length - 1 : 0;
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
        <View style={{backgroundColor: forcaSenha > 0 ? cores[1] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha > 1 ? cores[2] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha > 2 ? cores[3] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
        <View style={{backgroundColor: forcaSenha > 3 ? cores[4] : "#eaeaea", flex: 1, margin: 4, borderRadius: 3}}></View>
      </View>
      <Text style={{fontSize: 10, textAlign: "right", color: cores[forcaSenha], fontWeight: "bold"}}>{mensages.at(forcaSenha)}</Text>
    </View>
  );
} 