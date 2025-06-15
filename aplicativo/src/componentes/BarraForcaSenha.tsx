// SUBSTITUA O CONTEÚDO DE: aplicativo/src/componentes/BarraForcaSenha.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { validarSenha } from "../validacao/Validacao"; 

// Definindo as propriedades de forma explícita com uma interface
interface BarraForcaSenhaProps {
  senha: string;
}

// Usando o padrão React.FC (Functional Component) com a interface
export const BarraForcaSenha: React.FC<BarraForcaSenhaProps> = ({ senha }) => {
  const cores = ["#eaeaea", "red", "orange", "yellow", "#7CFC00"];
  const mensages = ["Senha Inválida", "Senha Fraca", "Senha Média", "Senha Boa", "Senha Forte"];
  const valSenha = validarSenha(senha);

  const forcaSenha = valSenha.tamanhoValido 
                     ? (valSenha.temMaiuscula ? 1 : 0) + (valSenha.temMinuscula ? 1 : 0) + 
                       (valSenha.temDigito ? 1 : 0) + (valSenha.temCaractereEspecial ? 1 : 0) 
                     : 0;
  const indiceMensagem = Math.min(forcaSenha, mensages.length - 1);

  return (
    <View style={{ width: '100%', marginTop: 5 }}>
      <View style={{ flexDirection: "row", height: 14, backgroundColor: "#dbdbdb", borderRadius: 5 }}>
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