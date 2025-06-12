import React from 'react';
import {
  Text,
  View,
  Pressable,
  Image,
  KeyboardAvoidingView
} from 'react-native';

import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles'; // Importa os estilos existentes
import TabBar from '../componentes/TabBar'; // Importa a TabBar

function TelaPerfil(): React.JSX.Element {
  const router = useRouter();

  // Dados mockados do usuário por enquanto
  const userName = "Nome do Usuário";
  const userEmail = "example@email.com";

  const handleAtualizarFoto = () => {
    // Lógica para atualizar a foto
    console.log("Atualizar Foto clicado");
  };

  const handleAtualizarNome = () => {
    // Lógica para atualizar o nome
    console.log("Atualizar Nome clicado");
  };

  const handleRedefinirSenha = () => {
    // Lógica para redefinir a senha
    console.log("Redefinir Senha clicado");
  };

  const handleExcluirConta = () => {
    // Lógica para excluir a conta
    console.log("Excluir Conta clicado");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 }}>
        <Pressable onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={{ color: "#eaeaea", fontSize: 20, fontWeight: "bold", marginLeft: 20 }}>Perfil</Text>
      </View>

      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Ícone de Usuário */}
        <View style={styles.userPic}>
          <AntDesign name="user" size={100} color="black" />
        </View>

        {/* Nome e E-mail do Usuário */}
        <Text style={[styles.textoPadrao, { fontSize: 24, marginTop: 10 }]}>{userName}</Text>
        <Text style={[styles.textoPadrao, { fontSize: 16, marginBottom: 30 }]}>{userEmail}</Text>

        {/* Botões de Ação */}
        <Pressable onPress={handleAtualizarFoto}>
          <View style={styles.Botao}>
            <Text style={styles.textoPadrao}>Atualizar Foto</Text>
          </View>
        </Pressable>

        <Pressable onPress={handleAtualizarNome}>
          <View style={styles.Botao}>
            <Text style={styles.textoPadrao}>Atualizar Nome</Text>
          </View>
        </Pressable>

        <Pressable onPress={handleRedefinirSenha}>
          <View style={styles.Botao}>
            <Text style={styles.textoPadrao}>Redefinir Senha</Text>
          </View>
        </Pressable>

        {/* Botão de Excluir Conta (com estilo diferente) */}
        <Pressable onPress={handleExcluirConta} style={{ marginTop: 20 }}>
          <View style={[styles.Botao, { backgroundColor: "#FF6347" }]}>
            <Text style={styles.textoPadrao}>Excluir a conta</Text>
          </View>
        </Pressable>
      </KeyboardAvoidingView>

      {/* TabBar */}
      <TabBar />
    </View>
  );
}

export default TelaPerfil;