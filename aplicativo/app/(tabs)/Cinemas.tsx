// aplicativo/app/(tabs)/Cinemas.tsx
// Mapa com toggle Cinemas/Eventos + galeria de fotos do diário
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
  ScrollView,
  Image,
} from 'react-native';
import { styles } from '../styles';
import OSMMapView, { OSMMapViewRef, OSMMarker, OSMRegion } from '../../src/componentes/OSMMapView';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { EventoService } from '../../src/services/EventoService';
import { Evento } from '../../src/models/Evento';
import { DiarioCinemaService } from '../../src/services/DiarioCinemaService';
import { DiarioCinema } from '../../src/models/DiarioCinema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabMode = 'cinemas' | 'eventos';

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

  const [activeTab, setActiveTab] = useState<TabMode>('cinemas');
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
    { id: 'rmr-12', name: 'Moviemax Camará Shopping', lat: -8.016000919158708, lon: -34.97786161514162, address: 'Rua Manoel Honorato da Costa, 555 - Vila da Fábrica, Camaragibe', hasEvents: false },
    { id: 'rmr-13', name: 'Cinemark Shopping Guararapes', lat: -8.0978, lon: -34.9346, address: 'Shopping Guararapes - Jaboatão dos Guararapes', hasEvents: false },
    { id: 'rmr-14', name: 'Cinesystem Costa Dourada', lat: -8.1260, lon: -34.9415, address: 'Shopping Costa Dourada - Cabo de Santo Agostinho', hasEvents: false },
    { id: 'rmr-15', name: 'Cinesystem Igarassu', lat: -7.8342, lon: -34.9065, address: 'Shopping Igarassu - Igarassu', hasEvents: false },
    { id: 'rmr-16', name: 'Moviemax Cine Royal', lat: -7.994952837830366, lon: -35.03826602065281, address: 'Av. Dr. Luiz Corrêa de Araújo, s/n - Centro, São Lourenço da Mata', hasEvents: false },
  ];

  // Estado do modo Cinemas
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [painelExpandido, setPainelExpandido] = useState(false);

  // Estado do modo Eventos
  const [todosEventos, setTodosEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState<'todos' | 'futuros' | 'passados'>('todos');
  const [diarioEntradas, setDiarioEntradas] = useState<DiarioCinema[]>([]);
  const [galeriaExpandida, setGaleriaExpandida] = useState(false);

  const eventoService = EventoService.getInstance();
  const diarioService = DiarioCinemaService.getInstance();

  const requestLocation = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  // ─── Funções do modo Cinemas ───
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

        if (!res.ok) continue;

        const data = await res.json();
        cinemasAPI = data.elements
          .map((el: any) => ({
            id: `osm-${el.id}`,
            name: el.tags?.name || "Cinema",
            lat: el.lat ?? el.center?.lat,
            lon: el.lon ?? el.center?.lon,
            address: el.tags?.["addr:street"] || '',
            hasEvents: false,
          }))
          .filter((c: Cinema) => c.lat && c.lon);

        if (cinemasAPI.length > 0) break;
      } catch (err) {
        console.warn(`Overpass endpoint ${endpoint} falhou:`, err);
      }
    }

    return cinemasAPI;
  };

  const buscarCinemas = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const cinemasAPI = await buscarCinemasOSM(lat, lon);
      
      // Mesclar com cinemas RMR fixos (sem duplicatas)
      const merged = [...cinemasAPI];
      for (const rmr of cinemasRMR) {
        const isDuplicate = cinemasAPI.some(
          c => Math.abs(c.lat - rmr.lat) < 0.003 && Math.abs(c.lon - rmr.lon) < 0.003
        );
        if (!isDuplicate) merged.push(rmr);
      }

      setCinemas(merged);
      setFilteredCinemas(merged);
    } catch (error) {
      console.error("Erro ao buscar cinemas:", error);
      setCinemas(cinemasRMR);
      setFilteredCinemas(cinemasRMR);
    } finally {
      setLoading(false);
    }
  };

  const carregarEventos = async () => {
    try {
      const eventos = await eventoService.getEventosProximos();
      setProximosEventos(eventos);
      
      const todos = await eventoService.getAllUserEventos();
      setTodosEventos(todos);

      // Marcar cinemas que têm eventos
      setCinemas(prev => prev.map(c => ({
        ...c,
        hasEvents: eventos.some(
          e => Math.abs(e.cinemaLat - c.lat) < 0.003 && Math.abs(e.cinemaLon - c.lon) < 0.003
        ),
      })));
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  const carregarDiario = async () => {
    try {
      const entradas = await diarioService.getAllEntradas();
      setDiarioEntradas(entradas);
    } catch (error) {
      console.error("Erro ao carregar diário:", error);
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
      carregarDiario();
    }, [])
  );

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

  // ─── Lógica do modo Eventos ───
  const getCorEvento = (evento: Evento): string => {
    const agora = new Date();
    const dataEvento = new Date(evento.dataHora);
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const amanha = new Date(hoje.getTime() + 86400000);
    const semana = new Date(hoje.getTime() + 7 * 86400000);

    if (dataEvento < hoje) return '#9E9E9E';       // Passado - cinza
    if (dataEvento < amanha) return '#4CAF50';      // Hoje - verde
    if (dataEvento < semana) return '#2196F3';      // Esta semana - azul
    return '#FF9800';                                // Futuro - laranja
  };

  const eventosFiltrados = todosEventos.filter(e => {
    if (filtroEvento === 'todos') return true;
    const agora = new Date();
    const dataEvento = new Date(e.dataHora);
    if (filtroEvento === 'futuros') return dataEvento >= agora;
    return dataEvento < agora;
  });

  // Marcadores do modo Cinemas
  const cinemaMarkers: OSMMarker[] = filteredCinemas.map((cinema, idx) => ({
    id: cinema.id || `${cinema.lat}-${cinema.lon}-${idx}`,
    latitude: cinema.lat,
    longitude: cinema.lon,
    title: cinema.name,
    description: cinema.address,
    color: cinema.hasEvents ? '#3E9C9C' : '#FF6347',
    hasEvents: cinema.hasEvents,
  }));

  // Marcadores do modo Eventos
  const eventoMarkers: OSMMarker[] = eventosFiltrados.map(e => ({
    id: e.id,
    latitude: e.cinemaLat,
    longitude: e.cinemaLon,
    title: e.cinemaName,
    description: `${e.movieTitle || ''} • ${formatarDataEvento(e.dataHora)}`,
    color: getCorEvento(e),
    hasEvents: true,
  }));

  const handleMarkerPress = (marker: OSMMarker) => {
    if (activeTab === 'cinemas') {
      const cinema = cinemas.find(c => c.id === marker.id);
      if (cinema) navegarParaCriarEvento(cinema);
    } else {
      navegarParaDetalhesEvento(marker.id);
    }
  };

  const renderEventoCard = ({ item }: { item: Evento }) => (
    <TouchableOpacity
      style={localStyles.eventoCard}
      onPress={() => navegarParaDetalhesEvento(item.id)}
      activeOpacity={0.7}
    >
      <View style={localStyles.eventoCardIcon}>
        <MaterialIcons name="event" size={24} color="#3E9C9C" />
      </View>
      <View style={localStyles.eventoCardContent}>
        <Text style={localStyles.eventoCardCinema} numberOfLines={1}>
          {item.cinemaName}
        </Text>
        <Text style={localStyles.eventoCardData}>
          {formatarDataEvento(item.dataHora)}
        </Text>
        {item.movieTitle && (
          <Text style={localStyles.eventoCardFilme} numberOfLines={1}>
            🎬 {item.movieTitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#B0C4DE" />
    </TouchableOpacity>
  );

  // Coletar todas as fotos do diário para galeria
  const todasFotos = diarioEntradas.flatMap(e => 
    e.fotos.map(url => ({ url, cinema: e.cinemaName, movie: e.movieTitle, data: e.data }))
  );

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="map" size={64} color="#3E9C9C" />
        <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 18 }}>
          Mapa não suportado no navegador.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { position: 'relative' }]}>
      {/* Toggle Cinemas / Eventos */}
      <View style={localStyles.toggleContainer}>
        <TouchableOpacity
          style={[localStyles.toggleBtn, activeTab === 'cinemas' && localStyles.toggleBtnActive]}
          onPress={() => setActiveTab('cinemas')}
        >
          <Ionicons name="film-outline" size={16} color={activeTab === 'cinemas' ? '#FFFFFF' : '#B0C4DE'} />
          <Text style={[localStyles.toggleText, activeTab === 'cinemas' && localStyles.toggleTextActive]}>
            Cinemas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[localStyles.toggleBtn, activeTab === 'eventos' && localStyles.toggleBtnActive]}
          onPress={() => setActiveTab('eventos')}
        >
          <Ionicons name="calendar-outline" size={16} color={activeTab === 'eventos' ? '#FFFFFF' : '#B0C4DE'} />
          <Text style={[localStyles.toggleText, activeTab === 'eventos' && localStyles.toggleTextActive]}>
            Eventos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barra de busca (apenas modo cinemas) */}
      {activeTab === 'cinemas' && (
        <View style={localStyles.searchContainer}>
          <View style={localStyles.searchBar}>
            <Ionicons name="search" size={20} color="#B0C4DE" />
            <TextInput
              style={localStyles.searchInput}
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
      )}

      {/* Filtros de eventos (apenas modo eventos) */}
      {activeTab === 'eventos' && (
        <View style={localStyles.filtrosContainer}>
          {(['todos', 'futuros', 'passados'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[localStyles.filtroBtn, filtroEvento === f && localStyles.filtroBtnActive]}
              onPress={() => setFiltroEvento(f)}
            >
              <Text style={[localStyles.filtroText, filtroEvento === f && localStyles.filtroTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
            latitudeDelta: activeTab === 'eventos' ? 0.15 : 0.05,
            longitudeDelta: activeTab === 'eventos' ? 0.15 : 0.05,
          }}
          markers={activeTab === 'cinemas' ? cinemaMarkers : eventoMarkers}
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
      <TouchableOpacity style={localStyles.recentrarButton} onPress={recentrarMapa}>
        <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modo Cinemas: botão lista de eventos + painel */}
      {activeTab === 'cinemas' && (
        <>
          <TouchableOpacity
            style={localStyles.eventosButton}
            onPress={() => router.push('/telas/ListaEventos')}
          >
            <MaterialIcons name="event-note" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {proximosEventos.length > 0 && (
            <View style={[
              localStyles.painelEventos,
              painelExpandido && localStyles.painelExpandido,
            ]}>
              <TouchableOpacity
                style={localStyles.painelHeader}
                onPress={() => setPainelExpandido(!painelExpandido)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="event" size={20} color="#3E9C9C" />
                  <Text style={localStyles.painelTitulo}>
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
        </>
      )}

      {/* Modo Eventos: legenda de cores + galeria de fotos */}
      {activeTab === 'eventos' && (
        <>
          {/* Legenda de cores */}
          <View style={localStyles.legenda}>
            <View style={localStyles.legendaItem}>
              <View style={[localStyles.legendaDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={localStyles.legendaText}>Hoje</Text>
            </View>
            <View style={localStyles.legendaItem}>
              <View style={[localStyles.legendaDot, { backgroundColor: '#2196F3' }]} />
              <Text style={localStyles.legendaText}>Semana</Text>
            </View>
            <View style={localStyles.legendaItem}>
              <View style={[localStyles.legendaDot, { backgroundColor: '#FF9800' }]} />
              <Text style={localStyles.legendaText}>Futuro</Text>
            </View>
            <View style={localStyles.legendaItem}>
              <View style={[localStyles.legendaDot, { backgroundColor: '#9E9E9E' }]} />
              <Text style={localStyles.legendaText}>Passado</Text>
            </View>
          </View>

          {/* Contador de eventos */}
          <View style={localStyles.contadorEventos}>
            <MaterialIcons name="event" size={16} color="#3E9C9C" />
            <Text style={localStyles.contadorText}>
              {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Galeria de Fotos do Diário */}
          <View style={[
            localStyles.galeriaContainer,
            galeriaExpandida && localStyles.galeriaExpandida,
          ]}>
            <TouchableOpacity
              style={localStyles.galeriaHeader}
              onPress={() => setGaleriaExpandida(!galeriaExpandida)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="image-multiple" size={20} color="#3E9C9C" />
                <Text style={localStyles.galeriaTitulo}>
                  Galeria ({todasFotos.length} foto{todasFotos.length !== 1 ? 's' : ''})
                </Text>
              </View>
              <Ionicons
                name={galeriaExpandida ? 'chevron-down' : 'chevron-up'}
                size={20}
                color="#B0C4DE"
              />
            </TouchableOpacity>

            {galeriaExpandida && (
              todasFotos.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 12 }}
                >
                  {todasFotos.map((foto, idx) => (
                    <View key={idx} style={localStyles.galeriaFotoCard}>
                      <Image
                        source={{ uri: foto.url }}
                        style={localStyles.galeriaFotoImg}
                        resizeMode="cover"
                      />
                      <Text style={localStyles.galeriaFotoLabel} numberOfLines={1}>
                        {foto.cinema}
                      </Text>
                      <Text style={localStyles.galeriaFotoData} numberOfLines={1}>
                        {foto.data} {foto.movie ? `• ${foto.movie}` : ''}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <MaterialCommunityIcons name="camera-off" size={32} color="#4A5568" />
                  <Text style={{ color: '#7A8A9E', marginTop: 8, fontSize: 13 }}>
                    Nenhuma foto no diário ainda
                  </Text>
                  <TouchableOpacity
                    style={localStyles.addDiarioBtn}
                    onPress={() => router.push('/telas/CriarDiario')}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>Registrar visita</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>

          {/* FAB para criar entrada no diário */}
          <TouchableOpacity
            style={localStyles.fabDiario}
            onPress={() => router.push('/telas/CriarDiario')}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  // Toggle
  toggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#1A2B3E',
    borderRadius: 25,
    padding: 4,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#3E9C9C',
  },
  toggleText: {
    color: '#B0C4DE',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  // Search
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 115 : 95,
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

  // Filtros de eventos
  filtrosContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 115 : 95,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  filtroBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1A2B3E',
    borderWidth: 1,
    borderColor: '#2E3D50',
  },
  filtroBtnActive: {
    backgroundColor: '#3E9C9C',
    borderColor: '#3E9C9C',
  },
  filtroText: {
    color: '#B0C4DE',
    fontSize: 13,
    fontWeight: '600',
  },
  filtroTextActive: {
    color: '#FFFFFF',
  },

  // Recentrar
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

  // Eventos button
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

  // Legenda de cores
  legenda: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    backgroundColor: 'rgba(26, 43, 62, 0.92)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    zIndex: 5,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendaText: {
    color: '#B0C4DE',
    fontSize: 11,
  },

  // Contador
  contadorEventos: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 145 : 125,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 43, 62, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    zIndex: 5,
  },
  contadorText: {
    color: '#B0C4DE',
    fontSize: 12,
    fontWeight: '600',
  },

  // Galeria
  galeriaContainer: {
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
  galeriaExpandida: {
    maxHeight: 300,
  },
  galeriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  galeriaTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  galeriaFotoCard: {
    marginRight: 12,
    width: 140,
  },
  galeriaFotoImg: {
    width: 140,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#2E3D50',
  },
  galeriaFotoLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  galeriaFotoData: {
    color: '#7A8A9E',
    fontSize: 10,
    marginTop: 2,
  },
  addDiarioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3E9C9C',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 12,
  },

  // FAB
  fabDiario: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#3E9C9C',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
