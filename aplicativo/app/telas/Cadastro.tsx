// O CONTEÚDO DESTE ARQUIVO FOI REESCRITO PARA SER 100% AUTOSSUFICIENTE E FUNCIONAL
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';

import { AntDesign, Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { auth } from '../../src/config/firebaseConfig';
import { BarraForcaSenha } from '../../src/componentes/BarraForcaSenha';
import { validarSenha } from '../../src/validacao/Validacao';
import logoFilmeia from '@/assets/images/filmeia-logo2.png';

function Cadastro(): React.JSX.Element {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [visivelConfirmar, setVisivelConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
        Alert.alert("Atenção", "Todos os campos são obrigatórios.");
        return;
    }
    const validacaoResult = validarSenha(senha);
    if (!validacaoResult.tamanhoValido || !validacaoResult.temMaiuscula || !validacaoResult.temMinuscula || !validacaoResult.temDigito || !validacaoResult.temCaractereEspecial) {
      Alert.alert("Senha Fraca", "A senha não atende aos requisitos mínimos de segurança.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro de Confirmação", "As senhas não coincidem!");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(userCredential.user, { displayName: nome });
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso! Faça o login para continuar.");
      router.replace('/telas/Login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Erro no Cadastro", "Este e-mail já está em uso.");
      } else {
        Alert.alert("Erro no Cadastro", "Houve um problema ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={estilos.container}>
      <ScrollView contentContainerStyle={estilos.scrollContainer}>
        <Image
          source={logoFilmeia}
          style={estilos.logo}
        />
        <Text style={estilos.title}>Cadastro</Text>

        <View style={estilos.inputContainer}>
            <AntDesign name="user" size={24} color="#b0b0b0" />
            <TextInput
              placeholder="Nome de Usuário"
              style={estilos.input}
              placeholderTextColor={"#b0b0b0"}
              onChangeText={setNome}
              value={nome}
            />
        </View>

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
        <BarraForcaSenha senha={senha} />

        <View style={estilos.inputContainer}>
          <Feather name="lock" size={24} color="#b0b0b0" />
          <TextInput
            placeholder="Confirmar Senha"
            style={estilos.input}
            placeholderTextColor={"#b0b0b0"}
            onChangeText={setConfirmarSenha}
            value={confirmarSenha}
            secureTextEntry={!visivelConfirmar}
          />
          <Pressable onPress={() => setVisivelConfirmar(!visivelConfirmar)}>
            <Feather name={visivelConfirmar ? "eye" : "eye-off"} size={24} color="#b0b0b0" />
          </Pressable>
        </View>

        <Pressable style={estilos.button} onPress={handleCadastro} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={estilos.buttonText}>Cadastrar</Text>
          )}
        </Pressable>

        <Link href={"/telas/Login"} asChild>
            <Pressable>
                <Text style={estilos.linkText}>
                    Já possui conta? <Text style={estilos.linkHighlight}>Faça Login!</Text>
                </Text>
            </Pressable>
        </Link>
      </ScrollView>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E3D50',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: '7.5%',
        paddingBottom: 20,
    },
    logo: {
        width: 250,
        height: 125,
        resizeMode: "contain",
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        color: "#EAEAEA",
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
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
        marginTop: 15,
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

export default Cadastro;