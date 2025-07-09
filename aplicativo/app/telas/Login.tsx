// O CONTEÚDO DESTE ARQUIVO FOI REESCRITO PARA SER 100% AUTOSSUFICIENTE E FUNCIONAL
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';

import { AntDesign, Feather } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/config/firebaseConfig';
import logoFilmeia from '@/assets/images/filmeia-logo2.png';

function Login(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.replace('/(tabs)/Home');
    } catch (error) {
      Alert.alert("Erro no Login", "Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={estilos.container}
    >
      <View style={estilos.innerContainer}>
        <Image source={logoFilmeia} style={estilos.logo} />
        <Text style={estilos.title}>Login</Text>
        
        <View style={estilos.inputContainer}>
          <AntDesign name="mail" size={24} color="#b0b0b0" />
          <TextInput
            placeholder="Email"
            style={estilos.input}
            placeholderTextColor={"#b0b0b0"}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={estilos.inputContainer}>
          <Feather name="lock" size={24} color="#b0b0b0" />
          <TextInput
            placeholder="Senha"
            style={estilos.input}
            placeholderTextColor={"#b0b0b0"}
            onChangeText={setSenha}
            value={senha}
            secureTextEntry={!visivel}
          />
          <Pressable onPress={() => setVisivel(!visivel)}>
            <Feather name={visivel ? "eye" : "eye-off"} size={24} color="#b0b0b0" />
          </Pressable>
        </View>

        <Pressable style={estilos.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="black" /> : <Text style={estilos.buttonText}>Entrar</Text>}
        </Pressable>
        
        <Link href="/telas/Cadastro" asChild>
          <Pressable>
            <Text style={estilos.linkText}>
              Não possui conta? <Text style={estilos.linkHighlight}>Cadastre-se!</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1F2D',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '7.5%',
  },
  logo: {
    width: 280,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    color: "#EAEAEA",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#4A6B8A',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#EAEAEA',
  },
  button: {
    backgroundColor: '#3E9C9C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
      color: '#EAEAEA',
      textAlign: 'center',
      marginTop: 20,
  },
  linkHighlight: {
      fontWeight: 'bold',
  }
});

export default Login;