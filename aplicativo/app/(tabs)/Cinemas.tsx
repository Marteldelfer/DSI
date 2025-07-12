import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { styles } from '../styles';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Cinemas() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cinemas, setCinemas] = useState<any[]>([]);

  const requestLocation = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return;
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  const buscarCinemasOSM = async (lat: number, lon: number) => {
    const query = `
      [out:json];
      (
        node["amenity"="cinema"](around:10000,${lat},${lon});
        way["amenity"="cinema"](around:10000,${lat},${lon});
        relation["amenity"="cinema"](around:10000,${lat},${lon});
      );
      out center;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      const data = await res.json();
      const cinemasEncontrados = data.elements.map((el: any) => ({
        id: String(el.id),
        name: el.tags?.name || 'Cinema desconhecido',
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
      }));
      setCinemas(cinemasEncontrados);
    } catch (erro) {
      console.error("erro:", erro);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      buscarCinemasOSM(latitude, longitude);
    }
  }, [location]);

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
      {Platform.OS === 'web' ? (
        <Text>Mapa não suportado no navegador.</Text>
      ) : (
        location && (
          <MapView
            style={{ width: '100%', height: '100%' }}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {cinemas.map((cinema, idx) => {
              const markerKey = cinema.id ? cinema.id : `${cinema.lat}-${cinema.lon}-${idx}`;
              return (
                <Marker
                  title={cinema.name}
                  coordinate={{
                    latitude: cinema.lat,
                    longitude: cinema.lon,
                  }}
                  // @ts-ignore
                  key={markerKey}
                />
              );
            })}
          </MapView>
        )
      )}
    </View>
  );
}
