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
  Alert
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';

import { styles } from '../../src/styles'; // Caminho de importação ajustado
import { auth } from '../../src/config/firebaseConfig'; // Caminho de importação ajustado
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
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.replace('/telas/Home');
    } catch (error: any) {
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
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />
      </View>

      <View style={styles.textInput}>
        <AntDesign name="lock" size={36} color="black" />
        <TextInput
          placeholder="Senha"
          secureTextEntry={true}
          style={styles.input}
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