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

import TelaCadastro from './telas/TelaCadastro';

// TODO Design

function App(): React.JSX.Element {
  return (
    <View>
      <StatusBar/>
      <TelaCadastro></TelaCadastro>
    </View>
  );
}

export default App;
