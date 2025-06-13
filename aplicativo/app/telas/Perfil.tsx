// aplicativo/app/telas/Perfil.tsx
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Alert, // Importe Alert para exibir mensagens ao usuário
  Platform // Importe Platform para verificar o sistema operacional (web/mobile)
} from 'react-native';

import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { onAuthStateChanged, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth'; // Importe as funções do Firebase Auth
import * as ImagePicker from 'expo-image-picker'; // Para selecionar imagens, se for implementar a atualização de foto

import { styles } from '../../src/styles'; // Caminho de importação ajustado
import TabBar from '../../src/componentes/TabBar'; // Caminho de importação ajustado
import { auth } from '../../src/config/firebaseConfig'; // Importação do auth

function TelaPerfil(): React.JSX.Element {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...'); // Estado para o nome
  const [emailUsuario, setEmailUsuario] = useState('Carregando...'); // Estado para o email
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null); // Estado para a URL da foto de perfil

  // Efeitos para carregar os dados do usuário e lidar com mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário está logado, atualiza os estados com os dados do usuário
        setNomeUsuario(user.displayName || 'Nome não definido');
        setEmailUsuario(user.email || 'Email não definido');
        setFotoPerfil(user.photoURL);
      } else {
        // Usuário não está logado, redirecionar para a tela de login
        router.replace('/telas/Login');
      }
    });

    return () => unsubscribe(); // Limpar o listener ao desmontar o componente
  }, []);

  // Função auxiliar para exibir prompts (compatível com web e mobile)
  const showPrompt = async (title: string, message: string, defaultValue: string = '', secureTextEntry: boolean = false): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // Para web, usamos window.prompt
      return window.prompt(message, defaultValue);
    } else {
      // Para mobile, usamos Alert.prompt
      return new Promise((resolve) => {
        Alert.prompt(
          title,
          message,
          (text) => resolve(text),
          secureTextEntry ? 'secure-text' : 'plain-text',
          defaultValue
        );
      });
    }
  };


  // Funções de manipulação para os botões de ação
  const handleAtualizarFoto = async () => {
    // Esta é uma implementação básica. Você precisaria de um serviço de armazenamento (ex: Firebase Storage)
    // para fazer upload da imagem e depois atualizar a photoURL do usuário.
    Alert.alert('Atualizar Foto', 'Funcionalidade de atualização de foto não implementada. Você precisaria de um serviço de armazenamento (como Firebase Storage) para isso.');

    // Exemplo de como selecionar uma imagem (requer expo-image-picker instalado)
    // let result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 1,
    // });
    // if (!result.canceled) {
    //   setFotoPerfil(result.assets[0].uri);
    //   // Aqui você faria o upload para o Firebase Storage e depois atualizaria user.photoURL
    //   // Ex: await updateProfile(auth.currentUser, { photoURL: 'nova_url_da_foto' });
    // }
  };

  const handleAtualizarNome = async () => {
    const user = auth.currentUser;
    if (user) {
      const newDisplayName = await showPrompt('Atualizar Nome', 'Digite seu novo nome:', nomeUsuario);
      if (newDisplayName && newDisplayName.trim() !== '') {
        try {
          await updateProfile(user, { displayName: newDisplayName.trim() });
          setNomeUsuario(newDisplayName.trim());
          Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
        } catch (error: any) {
          Alert.alert('Erro', `Não foi possível atualizar o nome: ${error.message}`);
          console.error('Erro ao atualizar nome:', error);
        }
      } else if (newDisplayName !== null) { // Se não for null, o usuário digitou vazio
        Alert.alert('Aviso', 'O nome não pode ser vazio.');
      }
    }
  };

  const handleRedefinirSenha = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      const currentPassword = await showPrompt('Redefinir Senha', 'Por motivos de segurança, você precisa reautenticar. Digite sua senha atual:', '', true);
      if (currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);

          const newPassword = await showPrompt('Nova Senha', 'Digite sua nova senha:', '', true);
          if (newPassword && newPassword.length >= 6) { // Validação básica de senha
            try {
              await updatePassword(user, newPassword);
              Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
            } catch (error: any) {
              Alert.alert('Erro', `Não foi possível redefinir a senha: ${error.message}`);
              console.error('Erro ao redefinir senha:', error);
            }
          } else if (newPassword !== null) {
            Alert.alert('Aviso', 'A nova senha deve ter pelo menos 6 caracteres.');
          }
        } catch (error: any) {
          Alert.alert('Erro de Reautenticação', `Senha atual incorreta ou erro: ${error.message}`);
          console.error('Erro de reautenticação:', error);
        }
      } else if (currentPassword !== null) {
        Alert.alert('Aviso', 'A senha atual é obrigatória para redefinir.');
      }
    } else {
      Alert.alert('Erro', 'Nenhum usuário logado ou e-mail não disponível para redefinir a senha.');
    }
  };

  const handleExcluirConta = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      const currentPassword = await showPrompt('Excluir Conta', 'Por motivos de segurança, você precisa reautenticar para excluir a conta. Digite sua senha atual:', '', true);
      if (currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await deleteUser(user);
          Alert.alert('Sucesso', 'Sua conta foi excluída permanentemente.');
          router.replace('/telas/Login'); // Redireciona para a tela de login após a exclusão
        } catch (error: any) {
          Alert.alert('Erro', `Não foi possível excluir a conta: ${error.message}`);
          console.error('Erro ao excluir conta:', error);
        }
      } else if (currentPassword !== null) {
        Alert.alert('Aviso', 'A senha atual é obrigatória para excluir a conta.');
      }
    } else {
      Alert.alert('Erro', 'Nenhum usuário logado ou e-mail não disponível para excluir a conta.');
    }
  };

  const handleDeslogar = async () => {
    try {
      await signOut(auth);
      router.replace('/telas/Login'); // Redireciona para a tela de login após o logout
    } catch (error: any) {
      console.error('Erro ao deslogar:', error.message);
      Alert.alert('Erro', 'Não foi possível deslogar. Tente novamente.');
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
          {fotoPerfil ? (
            <Image source={{ uri: fotoPerfil }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <AntDesign name="user" size={100} color="black" />
          )}
        </View>

        {/* Nome e E-mail do Usuário */}
        <Text style={[styles.textoPadrao, { fontSize: 24, marginTop: 10 }]}>{nomeUsuario}</Text>
        <Text style={[styles.textoPadrao, { fontSize: 16, marginBottom: 30 }]}>{emailUsuario}</Text>

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

        {/* Botão de Deslogar */}
        <Pressable onPress={handleDeslogar} style={{ marginTop: 10 }}>
          <View style={[styles.Botao, { backgroundColor: "#808080" }]}>
            <Text style={styles.textoPadrao}>Deslogar</Text>
          </View>
        </Pressable>
      </KeyboardAvoidingView>

      {/* TabBar */}
      <TabBar />
    </View>
  );
}

export default TelaPerfil;