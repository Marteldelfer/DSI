// CRIE ESTE NOVO ARQUIVO EM: aplicativo/app/(tabs)/Cinemas.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { styles } from '../styles'; // Ajuste o caminho se necessário
import MapView,{ Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

export default function Cinemas() {

  const [regiao, setRegiao] = useState<Region | undefined>(undefined);

  useFocusEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o uso da localização para usar o mapa.');
        return;
      }

      const local = await Location.getLastKnownPositionAsync();
      if (local) {setRegiao({
        latitude: local.coords.latitude,
        longitude: local.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })}
    })();
  });


  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      {regiao && (
      <MapView
        style={{width:"100%", height:"100%"}}
        initialRegion={regiao}
      >
        <Marker
          
          coordinate={{
            latitude: regiao.latitude,
            longitude: regiao.longitude,
          }}
          title="marcador de posição local"
          description="é aqui que você está."
        />
        <Marker
          coordinate={{
            latitude: -23.5505,
            longitude: -46.6333,
          }}
          title="Cinema Central"
          description="Exemplo de marcador de cinema"
        />
      </MapView> )}
    </View>
  );
}