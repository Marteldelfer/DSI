import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
	Pressable,
	Image,
	KeyboardAvoidingView,
  Alert
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';

import { auth } from '../../config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();

function TelaLogin(): React.JSX.Element {

	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (email.length === 0 || senha.length === 0) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.replace("/telas/Home");
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao fazer login. Por favor, tente novamente.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
      Alert.alert("Erro", errorMessage);
      console.error("Erro no login:", error);
    }
  };

	return (
		<KeyboardAvoidingView behavior={'padding'} style={styles.container}>

			<Image 
				style={{width:300, height: 250, marginLeft: "auto", marginRight: "auto", resizeMode: "contain"}}
				source={require("../../assets/images/filmeia-logo.png")}
			/>

			
			<View style={styles.textInput}>
				<AntDesign name="mail" size={36} color="black" />
				<TextInput placeholder="E-mail" autoComplete="email" placeholderTextColor={"black"} style={{padding: 0, paddingLeft: 12, color: "black"}} 
				onChangeText={next => {
					setEmail(next);
				}}></TextInput>
			</View>


			<View style={styles.textInput}>
				<AntDesign name="lock" size={36} color="black" />
				<TextInput placeholder="Senha" secureTextEntry={true} style={{padding: 0, paddingLeft: 12, color: "black"}} placeholderTextColor={"black"}
				onChangeText={next => {
					setSenha(next);
				}}></TextInput>
			</View>


			<Pressable onPress={handleLogin}>
				<View style={styles.Botao}>
					<Text style={styles.textoPadrao}>Login</Text>
				</View>
			</Pressable>


			<Text style={styles.textoPadrao}>
			  Não possui uma conta? <Link href={"/telas/Cadastro"}><Text style={{color: "#FFF380"}}>Criar uma conta</Text></Link>
			</Text>
      
		</KeyboardAvoidingView>
	);
}

export default TelaLogin;