import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Alert,
  TextInput
} from 'react-native';

import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import TabBar from '../componentes/TabBar';

import { auth } from '../../config/firebaseConfig';
import { 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut
} from 'firebase/auth';

function TelaPerfil(): React.JSX.Element {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("Carregando...");
  const [userEmail, setUserEmail] = useState("Carregando...");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setUserName(user.displayName || "Nome não definido");
        setUserEmail(user.email || "E-mail não definido");
      } else {
        setCurrentUser(null);
        setUserName("Não logado");
        setUserEmail("Não logado");
        router.replace("/telas/Login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAtualizarNome = async () => {
    if (!currentUser) {
      Alert.alert("Erro", "Nenhum usuário logado.");
      return;
    }
    if (userName.trim() === "") {
        Alert.alert("Erro", "O nome não pode ser vazio.");
        return;
    }

    try {
      await updateProfile(currentUser, { displayName: userName });
      Alert.alert("Sucesso", "Nome atualizado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", `Erro ao atualizar nome: ${error.message}`);
      console.error("Erro ao atualizar nome:", error);
    }
  };

  const handleRedefinirSenha = async () => {
    if (!currentUser) {
      Alert.alert("Erro", "Nenhum usuário logado.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (currentPassword.trim() === "") {
        Alert.alert("Erro", "A senha atual é necessária para redefinir a senha.");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        Alert.alert("Sucesso", "Senha redefinida com sucesso!");
        setNewPassword("");
        setCurrentPassword("");
    } catch (error: any) {
        Alert.alert("Erro", `Erro ao redefinir senha: ${error.message}`);
        console.error("Erro ao redefinir senha:", error);
    }
  };

  const handleExcluirConta = async () => {
    if (!currentUser) {
      Alert.alert("Erro", "Nenhum usuário logado.");
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {

              await deleteUser(currentUser);
              Alert.alert("Sucesso", "Conta excluída com sucesso.");
              router.replace("/telas/Login");
            } catch (error: any) {
              Alert.alert("Erro", `Erro ao excluir conta: ${error.message}`);
              console.error("Erro ao excluir conta:", error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sucesso", "Desconectado com sucesso.");
      router.replace("/telas/Login");
    } catch (error: any) {
      Alert.alert("Erro", `Erro ao desconectar: ${error.message}`);
      console.error("Erro ao desconectar:", error);
    }
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

        {/* Atualizar Nome */}
        <View style={styles.textInput}>
            <TextInput
                placeholder="Novo Nome"
                style={{ paddingLeft: 12, color: "black", flex: 1 }}
                placeholderTextColor={"#000000"}
                value={userName}
                onChangeText={setUserName}
            />
        </View>
        <Pressable onPress={handleAtualizarNome}>
          <View style={styles.Botao}>
            <Text style={styles.textoPadrao}>Atualizar Nome</Text>
          </View>
        </Pressable>

        {/* Redefinir Senha */}
        <View style={styles.textInput}>
            <TextInput
                placeholder="Senha Atual"
                secureTextEntry={true}
                style={{ paddingLeft: 12, color: "black", flex: 1 }}
                placeholderTextColor={"black"}
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />
        </View>
        <View style={styles.textInput}>
            <TextInput
                placeholder="Nova Senha"
                secureTextEntry={true}
                style={{ paddingLeft: 12, color: "black", flex: 1 }}
                placeholderTextColor={"black"}
                value={newPassword}
                onChangeText={setNewPassword}
            />
        </View>
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

        {/* Botão de Logout */}
        <Pressable onPress={handleLogout} style={{ marginTop: 10 }}>
          <View style={[styles.Botao, { backgroundColor: "#696969" }]}>
            <Text style={styles.textoPadrao}>Sair</Text>
          </View>
        </Pressable>

      </KeyboardAvoidingView>

      {/* TabBar */}
      <TabBar />
    </View>
  );
}

export default TelaPerfil;