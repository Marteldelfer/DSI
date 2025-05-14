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
  Platform,
  Pressable,
  KeyboardAvoidingView
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { useRouter, Link } from 'expo-router';

import { Ionicons, AntDesign } from '@expo/vector-icons';

import { Nunito_400Regular, useFonts } from '@expo-google-fonts/nunito';

const styles = StyleSheet.create({
  textInput: {
    padding: 8,
    backgroundColor: '#eaeaea',
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 26,
    width: 300,
    color: "black",
    fontFamily: "Nunito_400Regular",
  },
  userPic: {
    width: 110,
    height: 110,
    backgroundColor: '#eaeaea',
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 55
  },
  Botao: {
    backgroundColor: "#3E9C9C",
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 26,
    width: 300,
    color: "#eaeaea",
  },
  msgVal: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 300,
    color: "#FFF380",
    fontSize: 12,
    fontWeight: "bold"
  }
});

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

type mensageValidacao = {
  mensagemNome: string,
  mensagemEmail: string,
  mensagemSenha: string,
  mensagemConfirmacao: string
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
  // TODO Salvar no banco de 
  return true;
}

function cadastrarUsuario(nome: string, email: string, senha: string, confirmarSenha: string): boolean {
  if (validarCadastro(nome, email, senha, confirmarSenha)) {
    // TODO Salvar no banco de dados
    router.replace("/telas/Home");
    return true;
  }
  return false;
}

function BarraForcaSenha(senha: string): React.JSX.Element {

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
      margin: "auto",
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

function gerarMensagemValidacao(nome: string, email: string, senha: string, confirmarSenha: string): mensageValidacao {
  const msgVal: mensageValidacao = {
    mensagemNome: "",
    mensagemEmail: "",
    mensagemSenha: "",
    mensagemConfirmacao: ""
  }
  if (nome.length === 0) {
    msgVal.mensagemNome = "Nome é obrigatório";
  }
  if (!validarEmail(email)) {
    msgVal.mensagemEmail = "Email inválido";
  }
  if (!validarSenha(senha).tamanhoValido) {
    msgVal.mensagemSenha = "Senha muito curta!";
  }
  if (senha !== confirmarSenha) {
    msgVal.mensagemConfirmacao = "Senha diferente da confirmação";
  }
  return msgVal;
}

const router = useRouter();

function TelaCadastro(): React.JSX.Element {
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [msgVal, setMsgVal] = useState<mensageValidacao>(
    {mensagemSenha: "", mensagemEmail: "", mensagemNome: "", mensagemConfirmacao: ""}
  );
  
  return (
    <KeyboardAvoidingView 
      behavior={'padding'}
      style={{backgroundColor: "#2E3D50", height:"100%", justifyContent: "center"}}>

      <View style={styles.userPic}>
        <AntDesign name="user" size={100} color="black"/>
      </View>

      <View style={{padding: 12}}>
        <View style={[styles.textInput, {marginBottom: msgVal.mensagemNome ? 0 : 4}]}>
        <AntDesign name="user" size={36} color="black" />
          <TextInput placeholder="Nome" style={{paddingLeft: 12, color: "black"}} placeholderTextColor={"#000000"}
            onChangeText={next => {
              setNome(next);
          }}></TextInput>
        </View>
        <Text style={[styles.msgVal]}>{msgVal.mensagemNome}</Text>

        <View style={[styles.textInput, {marginBottom: msgVal.mensagemEmail ? 0 : 4}]}>
          <AntDesign name="mail" size={36} color="black" />
          <TextInput placeholder="E-mail" autoComplete="email" placeholderTextColor={"black"} style={{padding: 0, paddingLeft: 12, color: "black"}} 
            onChangeText={next => {
              setEmail(next);
            }}></TextInput>
        </View>
        <Text style={styles.msgVal}>{msgVal.mensagemEmail}</Text>

        <View style={styles.textInput}>
          <AntDesign name="lock" size={36} color="black" />
          <TextInput placeholder="Senha" secureTextEntry={true} style={{paddingLeft: 16, color: "black"}} placeholderTextColor={"black"}
            onChangeText={next => {
              setSenha(next);
          }}></TextInput>
        </View>
        {BarraForcaSenha(senha)}

        <View style={[styles.textInput, {marginBottom: msgVal.mensagemConfirmacao ? 0 : 4}]}>
          <AntDesign name="lock" size={36} color="black" />
          <TextInput placeholder="Confirmar Senha" placeholderTextColor={"black"} secureTextEntry={true} style={{paddingLeft: 12, color: "black"}} 
            onChangeText={next => {
              setConfirmarSenha(next);
          }}></TextInput>
        </View>
        <Text style={styles.msgVal}>{msgVal.mensagemConfirmacao}</Text>

      </View>
      <Pressable onPress={() => {
        setMsgVal(gerarMensagemValidacao(nome, email, senha, confirmarSenha));
        console.log("OK")
        cadastrarUsuario(nome, email, senha, confirmarSenha);
      }}>
        <View style={styles.Botao}>
          <Text style={{color: "#ffffff", fontWeight: "bold", textAlign: "center"}}>Cadastrar</Text>
        </View>
      </Pressable>
      <Text style={{color: "#eaeaea", fontWeight: "bold", width: 300, textAlign: "center", marginLeft: "auto", marginRight: "auto"}}>
        Já possui uma conta? <Link href={"/telas/Login"}><Text style={{color: "#FFF380"}}>Faça Login!</Text></Link>
      </Text>
    </KeyboardAvoidingView>
  )
}

export default TelaCadastro;