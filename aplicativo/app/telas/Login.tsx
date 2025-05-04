import { useRouter, Link } from 'expo-router';
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
	Pressable
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { AntDesign } from '@expo/vector-icons';

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
        fontFamily: "Nunito_400Regular"
      },
			Botao: {
				backgroundColor: "#007a74",
				padding: 8,
				marginTop: 4,
				marginBottom: 4,
				marginLeft: "auto",
				marginRight: "auto",
				borderRadius: 26,
				width: 300,
				color: "#eaeaea",
			}
});

const router = useRouter();

function login(email: string, senha: string): boolean {
    // Validar login na base de dados
    if (email.length > 0 && senha.length > 0) {
        router.navigate("/telas/Home");
        return true;
    }
    return false;
}

function TelaLogin(): React.JSX.Element {

	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");

	return (
		<View style={{backgroundColor: "#005F6B", height:"100%", justifyContent: "center"}}>
			<View style={styles.textInput}>
				<AntDesign name="mail" size={36} color="black" />
				<TextInput placeholder="E-mail" autoComplete="email" onChangeText={(next) => {
					setEmail(next);
				}}></TextInput>
			</View>
			<View style={styles.textInput}>
				<AntDesign name="lock" size={36} color="black" />
				<TextInput placeholder="Senha" secureTextEntry={true} onChangeText={(next) => {
					setSenha(next);
				}}></TextInput>
			</View>

			<Pressable onPress={() => {login(email, senha)}}>
				<View style={styles.Botao}>
					<Text style={{color: "#ffffff", fontWeight: "bold", textAlign: "center"}}>Login</Text>
				</View>
			</Pressable>

			<Text style={{color: "#ff7f50", fontWeight: "bold", width: 300, textAlign: "center", marginLeft: "auto", marginRight: "auto"}}>
			Não possui uma conta? <Link href={"/telas/Cadastro"}><Text style={{color: "#007a74"}}>Criar uma conta</Text></Link>
			</Text>
		</View>
	);
}

export default TelaLogin;