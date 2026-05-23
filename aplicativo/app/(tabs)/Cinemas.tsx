// aplicativo/app/(tabs)/Cinemas.tsx
// Mapa interativo aprimorado com callouts, busca, painel de eventos e marcadores diferenciados
// Usa OpenStreetMap via WebView (sem necessidade de API key do Google)
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { styles } from '../styles';
import OSMMapView, { OSMMapViewRef, OSMMarker, OSMRegion } from '../../src/componentes/OSMMapView';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { EventoService } from '../../src/services/EventoService';
import { Evento } from '../../src/models/Evento';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Cinema {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  hasEvents?: boolean;
}

export default function Cinemas() {
  const router = useRouter();
  const mapRef = useRef<OSMMapViewRef | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  // Cinemas conhecidos da Região Metropolitana do Recife (fallback)
  const cinemasRMR: Cinema[] = [
    { id: 'rmr-1', name: 'Cinemark RioMar Recife', lat: -8.0864, lon: -34.8948, address: 'Av. República do Líbano, 251 - Pina', hasEvents: false },
    { id: 'rmr-2', name: 'UCI Kinoplex RioMar', lat: -8.0868, lon: -34.8942, address: 'Shopping RioMar - Pina', hasEvents: false },
    { id: 'rmr-3', name: 'Cinemark Recife', lat: -8.0631, lon: -34.8716, address: 'Shopping Recife - Boa Viagem', hasEvents: false },
    { id: 'rmr-4', name: 'Cinépolis Shopping Recife', lat: -8.0635, lon: -34.8720, address: 'Shopping Recife - Boa Viagem', hasEvents: false },
    { id: 'rmr-5', name: 'Cinemark Tacaruna', lat: -8.0212, lon: -34.8718, address: 'Shopping Tacaruna - Santo Amaro', hasEvents: false },
    { id: 'rmr-6', name: 'Moviemax Plaza Shopping', lat: -8.0182, lon: -34.8557, address: 'Plaza Shopping Casa Forte', hasEvents: false },
    { id: 'rmr-7', name: 'Cinemark Shopping ETC', lat: -8.0585, lon: -34.8810, address: 'Shopping ETC - Boa Viagem', hasEvents: false },
    { id: 'rmr-8', name: 'Cinema da Fundaj - Derby', lat: -8.0597, lon: -34.8998, address: 'Rua Henrique Dias, 609 - Derby', hasEvents: false },
    { id: 'rmr-9', name: 'Cinema São Luiz', lat: -8.0625, lon: -34.8771, address: 'Rua da Aurora, 175 - Boa Vista', hasEvents: false },
    { id: 'rmr-10', name: 'Cinépolis Patteo Olinda', lat: -8.0110, lon: -34.8558, address: 'Shopping Patteo Olinda - Olinda', hasEvents: false },
    { id: 'rmr-11', name: 'Cinesystem Paulista North Way', lat: -7.9363, lon: -34.8744, address: 'Paulista North Way Shopping - Paulista', hasEvents: false },
    { id: 'rmr-12', name: 'Kinoplex Camará Shopping', lat: -7.8321, lon: -34.9289, address: 'Camará Shopping - Camaragibe', hasEvents: false },
    { id: 'rmr-13', name: 'Cinemark Shopping Guararapes', lat: -8.0978, lon: -34.9346, address: 'Shopping Guararapes - Jaboatão dos Guararapes', hasEvents: false },
    { id: 'rmr-14', name: 'Cinesystem Costa Dourada', lat: -8.1260, lon: -34.9415, address: 'Shopping Costa Dourada - Cabo de Santo Agostinho', hasEvents: false },
    { id: 'rmr-15', name: 'Cinesystem Igarassu', lat: -7.8342, lon: -34.9065, address: 'Shopping Igarassu - Igarassu', hasEvents: false },
  ];

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [painelExpandido, setPainelExpandido] = useState(false);

  const eventoService = EventoService.getInstance();

  const requestLocation = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  const buscarCinemasOSM = async (lat: number, lon: number) => {
    // Raio de 15km para busca rápida + cinemas RMR adicionados como fallback
    const queryStr = `
      [out:json][timeout:25];
      (
        node["amenity"="cinema"](around:15000,${lat},${lon});
        way["amenity"="cinema"](around:15000,${lat},${lon});
        relation["amenity"="cinema"](around:15000,${lat},${lon});
      );
      out center;
    `;

    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let cinemasAPI: Cinema[] = [];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(queryStr)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          console.warn(`Overpass API (${endpoint}) retornou status ${res.status}, tentando próximo...`);
          continue;
        }

        const contentType = res.headers.get('content-type') || '';
        const responseText = await res.text();

        if (!contentType.includes('json') && !responseText.trim().startsWith('{')) {
          console.warn(`Overpass API (${endpoint}) retornou resposta não-JSON (${contentType}), tentando próximo...`);
          continue;
        }

        const data = JSON.parse(responseText);

        if (!data.elements) {
          console.warn("Overpass API retornou resposta sem 'elements'.");
          continue;
        }

        cinemasAPI = data.elements
          .filter((el: any) => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
          .map((el: any) => ({
            id: String(el.id),
            name: el.tags?.name || 'Cinema desconhecido',
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
            address: el.tags?.['addr:street']
              ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ', ' + el.tags['addr:housenumber'] : ''}`
              : undefined,
            hasEvents: false,
          }));
        break; // Sucesso, sai do loop
      } catch (erro: any) {
        if (erro.name === 'AbortError') {
          console.warn(`Overpass API (${endpoint}) timeout, tentando próximo...`);
        } else {
          console.error(`Erro ao buscar cinemas de ${endpoint}:`, erro);
        }
      }
    }

    // Mescla cinemas da API com a lista fixa da RMR (sem duplicatas por proximidade)
    const todosCinemas = [...cinemasAPI];

    for (const cinemaRMR of cinemasRMR) {
      const jaExiste = cinemasAPI.some(c => {
        const dLat = Math.abs(c.lat - cinemaRMR.lat);
        const dLon = Math.abs(c.lon - cinemaRMR.lon);
        return dLat < 0.003 && dLon < 0.003;
      });

      if (!jaExiste) {
        todosCinemas.push(cinemaRMR);
      }
    }

    console.log(`Cinemas encontrados: ${cinemasAPI.length} da API + ${todosCinemas.length - cinemasAPI.length} do fallback RMR = ${todosCinemas.length} total`);

    setCinemas(todosCinemas);
    setFilteredCinemas(todosCinemas);
  };

  // Wrapper para chamar buscarCinemasOSM e garantir que loading é desligado
  const buscarCinemas = async (lat: number, lon: number) => {
    try {
      await buscarCinemasOSM(lat, lon);
    } finally {
      setLoading(false);
    }

  };

  const carregarEventos = async () => {
    try {
      const eventos = await eventoService.getEventosProximos();
      setProximosEventos(eventos);

      // Marcar cinemas que possuem eventos
      setCinemas(prev => {
        const eventoCinemaNames = new Set(eventos.map(e => e.cinemaName.toLowerCase()));
        return prev.map(c => ({
          ...c,
          hasEvents: eventoCinemaNames.has(c.name.toLowerCase()),
        }));
      });
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      buscarCinemas(latitude, longitude);
    }
  }, [location]);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [])
  );

  // Filtrar cinemas pelo nome quando a busca muda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCinemas(cinemas);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCinemas(cinemas.filter(c => c.name.toLowerCase().includes(q)));
    }
  }, [searchQuery, cinemas]);

  const recentrarMapa = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const navegarParaCriarEvento = (cinema: Cinema) => {
    router.push({
      pathname: '/telas/CriarEvento',
      params: {
        cinemaName: cinema.name,
        cinemaLat: String(cinema.lat),
        cinemaLon: String(cinema.lon),
      },
    });
  };

  const navegarParaDetalhesEvento = (eventoId: string) => {
    router.push({
      pathname: '/telas/DetalhesEvento',
      params: { eventoId },
    });
  };

  const formatarDataEvento = (dataHoraISO: string): string => {
    try {
      const date = new Date(dataHoraISO);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const hora = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes} às ${hora}:${min}`;
    } catch {
      return dataHoraISO;
    }
  };

  // Converter cinemas filtrados para marcadores do OSMMapView
  const osmMarkers: OSMMarker[] = filteredCinemas.map((cinema, idx) => ({
    id: cinema.id || `${cinema.lat}-${cinema.lon}-${idx}`,
    latitude: cinema.lat,
    longitude: cinema.lon,
    title: cinema.name,
    description: cinema.address,
    color: cinema.hasEvents ? '#3E9C9C' : '#FF6347',
    hasEvents: cinema.hasEvents,
  }));

  const handleMarkerPress = (marker: OSMMarker) => {
    const cinema = cinemas.find(c => c.id === marker.id);
    if (cinema) {
      navegarParaCriarEvento(cinema);
    }
  };

  const renderEventoCard = ({ item }: { item: Evento }) => (
    <TouchableOpacity
      style={cinemasStyles.eventoCard}
      onPress={() => navegarParaDetalhesEvento(item.id)}
      activeOpacity={0.7}
    >
      <View style={cinemasStyles.eventoCardIcon}>
        <MaterialIcons name="event" size={24} color="#3E9C9C" />
      </View>
      <View style={cinemasStyles.eventoCardContent}>
        <Text style={cinemasStyles.eventoCardCinema} numberOfLines={1}>
          {item.cinemaName}
        </Text>
        <Text style={cinemasStyles.eventoCardData}>
          {formatarDataEvento(item.dataHora)}
        </Text>
        {item.movieTitle && (
          <Text style={cinemasStyles.eventoCardFilme} numberOfLines={1}>
            🎬 {item.movieTitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#B0C4DE" />
    </TouchableOpacity>
  );

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="map" size={64} color="#3E9C9C" />
        <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 18 }}>
          Mapa não suportado no navegador.
        </Text>
        <Text style={{ color: '#B0C4DE', marginTop: 8, fontSize: 14 }}>
          Use o app no dispositivo móvel para ver o mapa.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      {/* Barra de busca flutuante */}
      <View style={cinemasStyles.searchContainer}>
        <View style={cinemasStyles.searchBar}>
          <Ionicons name="search" size={20} color="#B0C4DE" />
          <TextInput
            style={cinemasStyles.searchInput}
            placeholder="Buscar cinema..."
            placeholderTextColor="#7A8A9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#B0C4DE" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mapa */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3E9C9C" />
          <Text style={{ color: '#B0C4DE', marginTop: 12 }}>Carregando mapa...</Text>
        </View>
      ) : location ? (
        <OSMMapView
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          showsUserLocation={true}
          userLatitude={location.coords.latitude}
          userLongitude={location.coords.longitude}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          markers={osmMarkers}
          onMarkerPress={handleMarkerPress}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="location-outline" size={64} color="#B0C4DE" />
          <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 16 }}>
            Permissão de localização necessária
          </Text>
        </View>
      )}

      {/* Botão recentrar */}
      <TouchableOpacity style={cinemasStyles.recentrarButton} onPress={recentrarMapa}>
        <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botão para ver todos os eventos */}
      <TouchableOpacity
        style={cinemasStyles.eventosButton}
        onPress={() => router.push('/telas/ListaEventos')}
      >
        <MaterialIcons name="event-note" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Painel de próximos eventos */}
      {proximosEventos.length > 0 && (
        <View style={[
          cinemasStyles.painelEventos,
          painelExpandido && cinemasStyles.painelExpandido,
        ]}>
          <TouchableOpacity
            style={cinemasStyles.painelHeader}
            onPress={() => setPainelExpandido(!painelExpandido)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="event" size={20} color="#3E9C9C" />
              <Text style={cinemasStyles.painelTitulo}>
                Próximos Eventos ({proximosEventos.length})
              </Text>
            </View>
            <Ionicons
              name={painelExpandido ? 'chevron-down' : 'chevron-up'}
              size={20}
              color="#B0C4DE"
            />
          </TouchableOpacity>

          {painelExpandido && (
            <FlatList
              data={proximosEventos.slice(0, 5)}
              renderItem={renderEventoCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 250 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const cinemasStyles = StyleSheet.create({
  // Busca
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Botão recentrar
  recentrarButton: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    backgroundColor: '#3E9C9C',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  // Botão de lista de eventos
  eventosButton: {
    position: 'absolute',
    bottom: 240,
    right: 16,
    backgroundColor: '#1A2B3E',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#3E9C9C',
  },

  // Painel de eventos
  painelEventos: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A2B3E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  painelExpandido: {
    maxHeight: 360,
  },
  painelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  painelTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Card de evento
  eventoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3D50',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A2B3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventoCardContent: {
    flex: 1,
  },
  eventoCardCinema: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  eventoCardData: {
    color: '#3E9C9C',
    fontSize: 12,
    marginTop: 2,
  },
  eventoCardFilme: {
    color: '#B0C4DE',
    fontSize: 11,
    marginTop: 2,
  },
});
