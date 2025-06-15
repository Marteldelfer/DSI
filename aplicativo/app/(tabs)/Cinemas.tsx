// CRIE ESTE NOVO ARQUIVO EM: aplicativo/app/(tabs)/Cinemas.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles'; // Ajuste o caminho se necessário
import { AntDesign } from '@expo/vector-icons';

export default function Cinemas() {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <AntDesign name="tool" size={40} color="#eaeaea" />
      <Text style={{ color: '#eaeaea', fontSize: 20, marginTop: 15 }}>Tela de Cinemas</Text>
      <Text style={{ color: '#ccc', marginTop: 5 }}>Em desenvolvimento...</Text>
    </View>
  );
}