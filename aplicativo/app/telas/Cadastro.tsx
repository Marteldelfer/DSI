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

type usuario = {
  nome: string,
  email: string,
  senha: string
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

function validarCadastro(nome: string, email: string, senha: string, confirmarSenha: string): boolean {
  const valEmail = validarEmail(email);
  const valSenha = validarSenha(senha);

  if (senha !== confirmarSenha) {
    return false // TODO melhorar mensagens de erro
  }
  if (!(valEmail && valSenha.tamanhoValido)) {
    return false;
  }
  const novoUsuario: usuario = {
    nome: nome,
    email: email,
    senha: senha // TODO criptografar senha
  }
  // TODO Salvar no banco de dados
  return true;
}

function cadastrarUsuario(nome: string, email: string, senha: string, confirmarSenha: string): boolean {
  // TODO Salvar no banco de dados
  return true;
}

function TelaCadastro(): React.JSX.Element {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("")

  return (
    <View>
      <Text style={{color: "white"}}>Nome</Text>
      <TextInput placeholder="Nome" onChangeText={next => {
        setNome(next);
      }}></TextInput>

      <Text style={{color: "white"}}>Email</Text>
      <TextInput placeholder="E-mail" autoComplete="email" onChangeText={next => {
        setEmail(next);
      }}></TextInput>

      <Text style={{color: "white"}}>Senha</Text>
      <TextInput placeholder="Senha" secureTextEntry={true} onChangeText={next => {
        setSenha(next);
      }}></TextInput>

      <Text style={{color: "white"}}>Senha</Text>
      <TextInput placeholder="Confirmar Senha" secureTextEntry={true} onChangeText={next => {
        setConfirmarSenha(next);
      }}></TextInput>
      
      <Button title="Cadastrar" onPress={() => {
        console.log(cadastrarUsuario(nome, email, senha, confirmarSenha), nome, email, senha, confirmarSenha);
        // TODO ir para proxima tela
      }} ></Button>
    </View>
  )
}

export default TelaCadastro;