// aplicativo/app/telas/Login.tsx
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
  ActivityIndicator
} from 'react-native';

import { AntDesign, Feather } from '@expo/vector-icons';
import { styles } from '../../src/styles';
import { auth } from '../../src/config/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { BarraForcaSenha } from '../../src/componentes/BarraForcaSenha';

function Login(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("Usuário logado com sucesso!");
      router.replace('/telas/Home');
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      Alert.alert("Erro no Login", "Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: "#2E3D50", height: "100%", flexDirection: "column" }}>
      <ScrollView>
        <Image
          source={require("../../assets/images/filmeia-logo2.png")}
          style={{ width: 300, height: 150, resizeMode: "contain", marginLeft: "auto", marginRight: "auto", marginTop: 100 }}
        ></Image>
        <View style={{ width: 300, marginLeft: "auto", marginRight: "auto", marginTop: 10 }}>
          <Text style={{ color: "#eaeaea", fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" }}>
            Login
          </Text>
          <View style={styles.textInput}>
            <AntDesign name="mail" size={24} color="black" />
            <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor={"black"}
              onChangeText={setEmail}
              value={email}
            ></TextInput>
          </View>
          <View style={[styles.textInput, { flexDirection: "row", alignItems: "center" }]}>
            <Feather name="lock" size={24} color="black" />
            <TextInput
              placeholder="Senha"
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor={"black"}
              onChangeText={setSenha}
              value={senha}
              secureTextEntry={!visivel}
            ></TextInput>
            <Pressable onPress={() => setVisivel(!visivel)} style={{ marginLeft: 10 }}>
              <Feather name={visivel ? "eye" : "eye-off"} size={24} color="black" />
            </Pressable>
          </View>
          <BarraForcaSenha senha={senha} />
          <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#eaeaea" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </Pressable>
          <Link href={"/telas/Cadastro"} style={{ width: 150, marginLeft: "auto", marginRight: "auto" }}>
            <Text style={styles.link}>Ainda não tem conta?</Text>
          </Link>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

export default Login;