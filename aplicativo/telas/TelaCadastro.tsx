import React, { use, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type validacaoSenha = {
    tamanhoValido: boolean;
    contemMinuscula: boolean;
    contemMaiuscula: boolean;
    contemNumero: boolean;
    contemSimbolo: boolean;
}

function validarSenha(senha: string): validacaoSenha {
    const resValidacao: validacaoSenha = {
        tamanhoValido: false,
        contemMinuscula: false,
        contemMaiuscula: false,
        contemNumero: false,
        contemSimbolo: false
    };
    resValidacao.tamanhoValido = senha.length >= 6;
    resValidacao.contemMinuscula = senha.match(/[a-z]/g) ? true : false;
    resValidacao.contemMaiuscula = senha.match(/[A-Z]/g) ? true : false;
    resValidacao.contemNumero = senha.match(/[0-9]/g) ? true : false;
    resValidacao.contemSimbolo = senha.match(
        /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?-]/
    ) ? true : false;
    return resValidacao;
}

function validarEmail(email: string): boolean {
  return true; // TODO Validar email
}

function TelaCadastro(): React.JSX.Element {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [valSenha, setValSenha] = useState<validacaoSenha>(() => validarSenha(""));

  return (
    <View>
      <StatusBar/>
      <Text style={{color: "white"}}>Email</Text>
      <TextInput placeholder="endereço de email" autoComplete="email" onChangeText={next => setEmail(next)}></TextInput>
      <Text style={{color: "white"}}>Senha</Text>
      <TextInput placeholder="senha" onChangeText={next => {
        setSenha(next);
        setValSenha(validarSenha(next))
      }}></TextInput>

      <Text>tamanhoValido: {valSenha.tamanhoValido ? "true" : "false"}</Text>
      <Text>contemMinuscula: {valSenha.contemMinuscula ? "true" : "false"}</Text>
      <Text>contemMaiuscula: {valSenha.contemMaiuscula ? "true" : "false"}</Text>
      <Text>contemNumero: {valSenha.contemNumero ? "true" : "false"}</Text>
      <Text>contemSimbolo: {valSenha.contemNumero ? "true" : "false"}</Text>
    </View>
  )
}

export default TelaCadastro;