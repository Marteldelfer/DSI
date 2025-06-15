// aplicativo/app/telas/Cadastro.tsx
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';

import { AntDesign, Feather } from '@expo/vector-icons';
// MUDANÇA AQUI: Corrigido '=' para 'from'
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../../src/config/firebaseConfig';
import { styles } from '../../src/styles';
import { BarraForcaSenha } from '../../src/componentes/BarraForcaSenha';
import { validarSenha } from '../../src/validacao/Validacao';

function Cadastro(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [visivelConfirmar, setVisivelConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!validarSenha(senha).valido) {
      Alert.alert("Erro de Senha", "A senha não atende aos requisitos de segurança.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      console.log("Usuário cadastrado com sucesso!");
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso! Faça login.");
      router.replace('/telas/Login');
    } catch (error: any) {
      console.error("Erro no cadastro:", error.message);
      Alert.alert("Erro no Cadastro", "Houve um problema ao cadastrar. Tente novamente.");
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
            Cadastro
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
          <View style={[styles.textInput, { flexDirection: "row", alignItems: "center" }]}>
            <Feather name="lock" size={24} color="black" />
            <TextInput
              placeholder="Confirmar Senha"
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor={"black"}
              onChangeText={setConfirmarSenha}
              value={confirmarSenha}
              secureTextEntry={!visivelConfirmar}
            ></TextInput>
            <Pressable onPress={() => setVisivelConfirmar(!visivelConfirmar)} style={{ marginLeft: 10 }}>
              <Feather name={visivelConfirmar ? "eye" : "eye-off"} size={24} color="black" />
            </Pressable>
          </View>
          <Pressable style={styles.button} onPress={handleCadastro} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#eaeaea" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </Pressable>
          <Link href={"/telas/Login"} style={{ width: 150, marginLeft: "auto", marginRight: "auto" }}>
            <Text style={styles.link}>Já tem conta?</Text>
          </Link>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

export default Cadastro;