import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Alert
} from 'react-native';

import { useRouter, Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import * as Validacao from '../validacao/Validacao';
import { BarraForcaSenha } from '../componentes/BarraForcaSenha';

import { auth } from '../../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();

function TelaCadastro(): React.JSX.Element {
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [msgVal, setMsgVal] = useState<Validacao.mensageValidacao>(
    {mensagemSenha: "", mensagemEmail: "", mensagemNome: "", mensagemConfirmacao: ""}
  );

  const handleCadastro = async () => {
    const validacaoMensagens = Validacao.gerarMensagemValidacao(nome, email, senha, confirmarSenha);
    setMsgVal(validacaoMensagens);

    if (Object.values(validacaoMensagens).some(msg => msg !== "")) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.replace("/telas/Home");
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao cadastrar. Por favor, tente novamente.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso. Por favor, use outro.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha é muito fraca. Por favor, use uma senha mais forte.";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
      Alert.alert("Erro", errorMessage);
      console.error("Erro no cadastro:", error);
    }
  };
  
  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.container}>

      <View style={styles.userPic}>
        <AntDesign name="user" size={100} color="black"/>
      </View>


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


      <Pressable onPress={handleCadastro}>
        <View style={styles.Botao}>
          <Text style={{color: "#ffffff", fontWeight: "bold", textAlign: "center"}}>Cadastrar</Text>
        </View>
      </Pressable>


      <Text style={styles.textoPadrao}>
        Já possui uma conta? <Link href={"/telas/Login"}><Text style={{color: "#FFF380"}}>Faça Login</Text></Link>
      </Text>

    </KeyboardAvoidingView>
  )
}

export default TelaCadastro;