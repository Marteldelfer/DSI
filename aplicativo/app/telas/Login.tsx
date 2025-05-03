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
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

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
        <View>
            <TextInput placeholder="E-mail" autoComplete="email" onChangeText={(next) => {
                setEmail(next);
            }}></TextInput>
            <TextInput placeholder="senha" secureTextEntry={true} onChangeText={(next) => {
                setSenha(next);
            }}></TextInput>

            <Button title="Login" onPress={() => {
                login(email, senha);
            }}></Button>

            <Text>Não possui uma conta? <Link href="/telas/Cadastro">criar uma conta</Link></Text>
        </View>
    );
}

export default TelaLogin;