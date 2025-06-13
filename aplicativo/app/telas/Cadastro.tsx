// aplicativo/app/telas/Cadastro.tsx
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Alert // Importa Alert para exibir mensagens de erro
} from 'react-native';

import { useRouter, Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../../src/styles'; // Seus estilos globais

import * as Validacao from '../../src/validacao/Validacao'; // Suas funções de validação
import { BarraForcaSenha } from '../../src/componentes/BarraForcaSenha'; // Seu componente BarraForcaSenha

// Importa a instância de autenticação do Firebase
import { auth } from '../../src/config/firebaseConfig';
// Importa a função de criação de usuário com e-mail e senha
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
    // Validação usando suas funções existentes
    const validationMessages = Validacao.gerarMensagemValidacao(
      nome,
      email,
      password,
      confirmPassword
    );
    setMsgVal(validationMessages);

    // Verifica se há alguma mensagem de erro de validação local
    const hasLocalValidationErrors = Object.values(validationMessages).some(
      (msg) => msg !== ''
    );

    if (hasLocalValidationErrors) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os campos inválidos.');
      return;
    }

    try {
      // Tenta criar um novo usuário com e-mail e senha usando o Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);
      // Se o cadastro for bem-sucedido, exibe um alerta e redireciona para a tela Home
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/telas/Home'); // Redireciona para a tela Home após o cadastro
    } catch (error: any) {
      // Captura e trata os erros específicos do Firebase Authentication
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
            errorMessage = `Erro: ${error.message}`; // Mensagem de erro genérica para outros casos
        }
      }
      Alert.alert('Erro no Cadastro', errorMessage);
      console.error('Erro de cadastro:', error); // Loga o erro completo para depuração
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
      {/* Correção: Chamar BarraForcaSenha como um componente JSX */}
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