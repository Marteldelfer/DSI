/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { use, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

// TODO Validação de email e senha
// TODO Design

function App(): React.JSX.Element {

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  return (
    <View>
      <StatusBar/>
      <Text style={{color: "white"}}>Email</Text>
      <TextInput placeholder="endereço de email" onChangeText={next => setEmail(next)}></TextInput>
      <Text style={{color: "white"}}>Senha</Text>
      <TextInput placeholder="senha" onChangeText={next => setSenha(next)}></TextInput>
    </View>
  );
}

export default App;
