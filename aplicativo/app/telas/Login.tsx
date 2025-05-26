import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
	Pressable,
	Image,
	KeyboardAvoidingView
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';

const router = useRouter();

function login(email: string, senha: string): boolean {
    // Validar login na base de dados
    if (email.length > 0 && senha.length > 0) {
        router.replace("/telas/Home");
        return true;
    }
    return false;
}

function TelaLogin(): React.JSX.Element {

	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");

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


			<Pressable onPress={() => {login(email, senha)}}>
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