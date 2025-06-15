// SUBSTITUA O CONTEÚDO DE: aplicativo/app/telas/Login.tsx
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
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
import { styles } from '../../src/styles';
import { auth } from '../../src/config/firebaseConfig';

// --- SOLUÇÃO DEFINITIVA USANDO ALIAS DE CAMINHO ---
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
      router.replace('/Home');
    } catch (error) {
      Alert.alert("Erro no Login", "Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={loginStyles.innerContainer}>
        <Image source={logoFilmeia} style={loginStyles.logo} />
        <Text style={loginStyles.title}>Login</Text>
        
        <View style={styles.textInput}>
          <AntDesign name="mail" size={24} color="black" />
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor={"black"}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.textInput}>
          <Feather name="lock" size={24} color="black" />
          <TextInput
            placeholder="Senha"
            style={styles.input}
            placeholderTextColor={"black"}
            onChangeText={setSenha}
            value={senha}
            secureTextEntry={!visivel}
          />
          <Pressable onPress={() => setVisivel(!visivel)}>
            <Feather name={visivel ? "eye" : "eye-off"} size={24} color="black" />
          </Pressable>
        </View>

        <Pressable style={[styles.button, { marginTop: 20 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#eaeaea" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
        
        <Link href="/telas/Cadastro" asChild>
          <Pressable style={{ marginTop: 20 }}>
            <Text style={{ color: '#eaeaea', textAlign: 'center' }}>
              Não possui conta? <Text style={{ fontWeight: 'bold' }}>Cadastre-se!</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const loginStyles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '85%',
    alignSelf: 'center',
  },
  logo: {
    width: 280,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    color: "#eaeaea",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
});


export default Login;