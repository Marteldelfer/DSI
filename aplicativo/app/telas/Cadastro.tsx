// aplicativo/app/telas/Cadastro.tsx
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Alert
} from 'react-native';

import { useRouter, Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../../src/styles'; // Caminho de importação ajustado
import * as Validacao from '../../src/validacao/Validacao'; // Caminho de importação ajustado
import { BarraForcaSenha } from '../../src/componentes/BarraForcaSenha'; // Caminho de importação ajustado

import { auth } from '../../src/config/firebaseConfig'; // Caminho de importação ajustado
import { createUserWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();

function TelaCadastro(): React.JSX.Element {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmarSenha] = useState<string>('');

  const [msgVal, setMsgVal] = useState<Validacao.mensageValidacao>({
    mensagemSenha: '',
    mensagemEmail: '',
    mensagemNome: '',
    mensagemConfirmacao: '',
  });

  const handleCadastro = async () => {
    const validationMessages = Validacao.gerarMensagemValidacao(
      nome,
      email,
      password,
      confirmPassword
    );
    setMsgVal(validationMessages);

    const hasLocalValidationErrors = Object.values(validationMessages).some(
      (msg) => msg !== ''
    );

    if (hasLocalValidationErrors) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os campos inválidos.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/telas/Home');
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao criar a conta.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este e-mail já está em uso.';
            break;
          case 'auth/weak-password':
            errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'E-mail inválido.';
            break;
          default:
            errorMessage = `Erro: ${error.message}`;
        }
      }
      Alert.alert('Erro no Cadastro', errorMessage);
      console.error('Erro de cadastro:', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.container}>
      <View style={styles.userPic}>
        <AntDesign name="user" size={100} color="black" />
      </View>

      <View style={[styles.textInput, { marginBottom: msgVal.mensagemNome ? 0 : 4 }]}>
        <AntDesign name="user" size={36} color="black" />
        <TextInput
          placeholder="Nome"
          style={styles.input}
          placeholderTextColor={'#000000'}
          onChangeText={setNome}
          value={nome}
        />
      </View>
      <Text style={[styles.msgVal]}>{msgVal.mensagemNome}</Text>

      <View style={[styles.textInput, { marginBottom: msgVal.mensagemEmail ? 0 : 4 }]}>
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
      <Text style={styles.msgVal}>{msgVal.mensagemEmail}</Text>

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
      <BarraForcaSenha senha={password} />

      <View style={[styles.textInput, { marginBottom: msgVal.mensagemConfirmacao ? 0 : 4 }]}>
        <AntDesign name="lock" size={36} color="black" />
        <TextInput
          placeholder="Confirmar Senha"
          placeholderTextColor={'black'}
          secureTextEntry={true}
          style={styles.input}
          onChangeText={setConfirmarSenha}
          value={confirmPassword}
        />
      </View>
      <Text style={styles.msgVal}>{msgVal.mensagemConfirmacao}</Text>

      <Pressable onPress={handleCadastro}>
        <View style={styles.Botao}>
          <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>Cadastrar</Text>
        </View>
      </Pressable>

      <Text style={styles.textoPadrao}>
        Já possui uma conta?{' '}
        <Link href={'/telas/Login'}>
          <Text style={styles.linkText}>Faça Login</Text>
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

export default TelaCadastro;