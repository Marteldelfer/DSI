// CRIE ESTE NOVO ARQUIVO EM: aplicativo/app/(tabs)/Cinemas.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { styles } from '../styles'; // Ajuste o caminho se necessário
import MapView,{ Marker, Region } from 'react-native-maps';
import { getCurrentPositionAsync, LocationAccuracy, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync } from 'expo-location';

const GOOGLE_API_KEY = 'AIzaSyCwI9Sp2MUZDl918UtBz_x3OFRHKA6jCoE'

export default function Cinemas() {

  const [lugar, setLugar] = useState<LocationObject | undefined>(undefined);
  const [cinemas, setCinemas] = useState<any[]>([]);

  async function requestPermissaoGPS() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const posicaoAtual = await getCurrentPositionAsync()
      setLugar(posicaoAtual)
    }
  }

  useEffect(() => {
  if (lugar) {
    const buscarCinemas = async () => {
      try {
        const api_url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lugar.coords.latitude},${lugar.coords.longitude}&radius=10000&type=movie_theater&key=${GOOGLE_API_KEY}`
        const res = await fetch(
          api_url
        );
        const data = await res.json().then();
        setCinemas(data.results);
      } catch (erro) {
        console.error("erro:", erro);
      }
    };
    buscarCinemas(); // executa a função
    }}, [lugar]);


  useEffect(() => {
    requestPermissaoGPS();
    watchPositionAsync({
      accuracy: LocationAccuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 1
    }, (resposta) => {setLugar(resposta);}
    );
  },[])

  



  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      {lugar && (
      <MapView
        style={{width:"100%", height:"100%"}}
        showsUserLocation={true}
        initialRegion={{
          latitude: lugar.coords.latitude,
          longitude: lugar.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
    {cinemas.map((cinema) => (
    <Marker
      key={cinema.place_id}
      title={cinema.name}
      coordinate={{
      latitude: cinema.geometry.location.lat,
      longitude: cinema.geometry.location.lng,
    }}
  />
))}

      </MapView> )}
    </View>
  );
}