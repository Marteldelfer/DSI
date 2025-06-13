// aplicativo/app/telas/Login.tsx
import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Alert // Importa Alert para exibir mensagens de erro
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';

import { styles } from '../../src/styles'; // Seus estilos globais

// Importa a instância de autenticação do Firebase
import { auth } from '../../src/config/firebaseConfig';
// Importa a função de login com e-mail e senha
import { signInWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();

function TelaLogin(): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Tenta fazer login com e-mail e senha usando o Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Se o login for bem-sucedido:
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.replace('/telas/Home'); // Redireciona para a tela Home após o login
    } catch (error: any) {
      // Tratar erros de login do Firebase
      let errorMessage = 'Ocorreu um erro ao fazer login.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Senha incorreta.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'E-mail inválido.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro: ${error.message}`;
        }
      }
      Alert.alert('Erro no Login', errorMessage);
      console.error('Erro de login:', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
      <Image
        style={{ width: 300, height: 250, marginLeft: 'auto', marginRight: 'auto', resizeMode: 'contain' }}
        source={require('../../assets/images/filmeia-logo.png')}
      />

      <View style={styles.textInput}>
        <AntDesign name="mail" size={36} color="black" />
        <TextInput
          placeholder="E-mail"
          autoComplete="email"
          placeholderTextColor={'black'}
          style={styles.input} // Usando o estilo 'input' de styles.tsx
          onChangeText={setEmail}
          value={email}
        />
      </View>

      <View style={styles.textInput}>
        <AntDesign name="lock" size={36} color="black" />
        <TextInput
          placeholder="Senha"
          secureTextEntry={true}
          style={styles.input} // Usando o estilo 'input' de styles.tsx
          placeholderTextColor={'black'}
          onChangeText={setPassword}
          value={password}
        />
      </View>

      <Pressable onPress={handleLogin}>
        <View style={styles.Botao}>
          <Text style={styles.textoPadrao}>Login</Text>
        </View>
      </Pressable>

      <Text style={styles.textoPadrao}>
        Não possui uma conta?{' '}
        <Link href={'/telas/Cadastro'}>
          <Text style={styles.linkText}>Criar uma conta</Text>
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

export default TelaLogin;