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
  Button,
  Alert,
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
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function cadastrarUsuario(email: string, senha: string): boolean {
  const valEmail = validarEmail(email);
  const valSenha = validarSenha(senha);
  if (!(valEmail && valSenha.tamanhoValido)) {
    return false;
  }
  const forcaSenha: number = Object.values(valSenha).filter((bool) => bool).length;

  if (forcaSenha < 3) {
    // TODO gerar alerta de senha fraca
  }
  // TODO Salvar no banco de dados
  return true;
}

function TelaCadastro(): React.JSX.Element {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [valSenha, setValSenha] = useState<validacaoSenha>(() => validarSenha(""));
  const [valEmail, setValEmail] = useState<boolean>(() => false);

  return (
    <View>
      <Text style={{color: "white"}}>Email</Text>
      <TextInput placeholder="endereço de email" autoComplete="email" onChangeText={next => {
        setEmail(next);
        setValEmail(validarEmail(next));
      }}></TextInput>
      <Text style={{color: "white"}}>Senha</Text>
      <TextInput placeholder="senha" onChangeText={next => {
        setSenha(next);
        setValSenha(validarSenha(next)); 
      }}></TextInput>
      <Button title="Cadastrar" onPress={() => {
        console.log(cadastrarUsuario(email, senha));
        // TODO ir para proxima tela
      }} ></Button>
    </View>
  )
}

export default TelaCadastro;