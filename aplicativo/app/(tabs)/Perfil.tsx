// GARANTA QUE ESTE É O CONTEÚDO DE: aplicativo/app/(tabs)/Perfil.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, Image, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth'; //
import { styles } from '../styles'; //
import { auth } from '../../src/config/firebaseConfig'; //

function TelaPerfil() {
  const router = useRouter(); //
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...'); //
  const [emailUsuario, setEmailUsuario] = useState('Carregando...'); //

  useEffect(() => { //
    const unsubscribe = onAuthStateChanged(auth, (user) => { //
      if (user) { //
        setNomeUsuario(user.displayName || 'Nome não definido'); //
        setEmailUsuario(user.email || 'Email não definido'); //
      }
    });
    return () => unsubscribe(); //
  }, []); //

  const handleAtualizarFoto = () => Alert.alert('Funcionalidade indisponível.'); //
  const handleAtualizarNome = () => Alert.alert('Funcionalidade indisponível.'); //
  const handleRedefinirSenha = () => Alert.alert('Funcionalidade indisponível.'); //
  const handleExcluirConta = () => Alert.alert('Funcionalidade indisponível.'); //

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/telas/Login'); // Redireciona para a tela de Login após deslogar
    } catch (error: any) {
      Alert.alert('Erro ao deslogar', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={perfilStyles.header}>
        <Pressable onPress={() => router.canGoBack() && router.back()}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
      </View>
      <View style={perfilStyles.content}>
        <View style={perfilStyles.profilePicContainer}>
          <AntDesign name="user" size={80} color="black" />
        </View>
        <Text style={perfilStyles.userName}>{nomeUsuario}</Text>
        <Text style={perfilStyles.userEmail}>{emailUsuario}</Text>

        <View style={perfilStyles.buttonContainer}>
          <Pressable style={styles.Botao} onPress={handleAtualizarFoto}><Text style={styles.textoBotao}>Atualizar Foto</Text></Pressable>
          <Pressable style={styles.Botao} onPress={handleAtualizarNome}><Text style={styles.textoBotao}>Atualizar Nome</Text></Pressable>
          <Pressable style={styles.Botao} onPress={handleRedefinirSenha}><Text style={styles.textoBotao}>Redefinir Senha</Text></Pressable>
          {/* Novo botão de Deslogar */}
          <Pressable style={[styles.Botao, perfilStyles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.textoBotao}>Deslogar</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.Botao, perfilStyles.deleteButton]} onPress={handleExcluirConta}>
          <Text style={styles.textoBotao}>Excluir a conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const perfilStyles = StyleSheet.create({
  header: { paddingTop: 50, paddingHorizontal: 20, alignSelf: 'flex-start' }, //
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 }, //
  profilePicContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#3E9C9C', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }, //
  userName: { color: '#eaeaea', fontSize: 24, fontWeight: 'bold' }, //
  userEmail: { color: '#ccc', fontSize: 16, marginBottom: 40 }, //
  buttonContainer: { width: '100%', gap: 5 }, //
  deleteButton: { backgroundColor: '#FF6347', position: 'absolute', bottom: 20, width: '100%' }, //
  logoutButton: { // Estilo para o novo botão de deslogar
    backgroundColor: '#6C7A89', // Uma cor neutra para o botão de deslogar
  },
});

export default TelaPerfil; //