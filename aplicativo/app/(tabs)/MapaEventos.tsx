// aplicativo/app/(tabs)/MapaEventos.tsx
// Mapa de eventos do usuário com marcadores coloridos por temporalidade
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { styles } from '../styles';
import OSMMapView, { OSMMapViewRef, OSMMarker, OSMRegion } from '../../src/componentes/OSMMapView';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { EventoService } from '../../src/services/EventoService';
import { Evento } from '../../src/models/Evento';

// ─── Color constants ───────────────────────────────────────────────
const COLORS = {
  today: '#4CAF50',
  thisWeek: '#2196F3',
  future: '#FF9800',
  past: '#9E9E9E',
  accent: '#3E9C9C',
  background: '#2E3D50',
  surface: '#1A2B3E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0C4DE',
};

type FilterMode = 'todos' | 'futuros' | 'passados';

// ─── Helpers ───────────────────────────────────────────────────────
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function getEventTimingColor(dataHoraISO: string): string {
  const eventDate = new Date(dataHoraISO);
  const now = new Date();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (eventDate < now && eventDate < todayStart) {
    // Truly in the past (before today started)
    return COLORS.past;
  }
  if (eventDate >= todayStart && eventDate <= todayEnd) {
    return COLORS.today;
  }
  if (eventDate > todayEnd && eventDate <= weekEnd) {
    return COLORS.thisWeek;
  }
  if (eventDate > weekEnd) {
    return COLORS.future;
  }
  // Fallback for past events that already happened today
  return COLORS.past;
}

function getTimingLabel(dataHoraISO: string): string {
  const color = getEventTimingColor(dataHoraISO);
  switch (color) {
    case COLORS.today: return 'Hoje';
    case COLORS.thisWeek: return 'Esta semana';
    case COLORS.future: return 'Futuro';
    case COLORS.past: return 'Passado';
    default: return '';
  }
}

function formatarDataEvento(dataHoraISO: string): string {
  try {
    const date = new Date(dataHoraISO);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${min}`;
  } catch {
    return dataHoraISO;
  }
}

function applyFilter(eventos: Evento[], filter: FilterMode): Evento[] {
  if (filter === 'todos') return eventos;

  const now = new Date();
  if (filter === 'futuros') {
    return eventos.filter(e => new Date(e.dataHora) >= startOfToday());
  }
  // passados
  return eventos.filter(e => new Date(e.dataHora) < startOfToday());
}

// ─── Component ─────────────────────────────────────────────────────
export default function MapaEventos() {
  const router = useRouter();
  const mapRef = useRef<OSMMapViewRef | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('todos');

  const eventoService = EventoService.getInstance();

  // ── Location ──
  const requestLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (err) {
      console.error('Erro ao obter localização:', err);
    }
  };

  // ── Events ──
  const carregarEventos = async () => {
    try {
      setLoading(true);
      const allEventos = await eventoService.getAllUserEventos();
      setEventos(allEventos);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [])
  );

  // ── Filtered events ──
  const filteredEventos = applyFilter(eventos, filter);

  // ── Markers ──
  const markers: OSMMarker[] = filteredEventos
    .filter(e => e.cinemaLat && e.cinemaLon)
    .map(e => ({
      id: e.id,
      latitude: e.cinemaLat,
      longitude: e.cinemaLon,
      title: e.cinemaName,
      description: e.movieTitle || '',
      color: getEventTimingColor(e.dataHora),
      hasEvents: true,
    }));

  // ── Map region ──
  const lat = location?.coords.latitude ?? -23.5505;
  const lon = location?.coords.longitude ?? -46.6333;

  // If there are markers, center on the first one; otherwise use user location
  const initialRegion: OSMRegion = markers.length > 0
    ? {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };

  // ── Handlers ──
  const handleMarkerPress = (marker: OSMMarker) => {
    router.push({
      pathname: '/telas/DetalhesEvento',
      params: { eventoId: marker.id },
    });
  };

  const recentrarMapa = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 500);
    }
  };

  // ── Filter buttons ──
  const filterOptions: { key: FilterMode; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'futuros', label: 'Futuros' },
    { key: 'passados', label: 'Passados' },
  ];

  // ── Web fallback ──
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="map" size={64} color={COLORS.accent} />
        <Text style={{ color: COLORS.textPrimary, marginTop: 16, fontSize: 18 }}>
          Mapa não suportado no navegador.
        </Text>
        <Text style={{ color: COLORS.textSecondary, marginTop: 8, fontSize: 14 }}>
          Use o app no dispositivo móvel para ver o mapa.
        </Text>
      </View>
    );
  }

  // ── Main render ──
  return (
    <View style={[styles.container, { position: 'relative' }]}>
      {/* ── Filter bar ── */}
      <View style={localStyles.filterContainer}>
        <View style={localStyles.filterBar}>
          {filterOptions.map(opt => {
            const isActive = filter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  localStyles.filterButton,
                  isActive && localStyles.filterButtonActive,
                ]}
                onPress={() => setFilter(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  localStyles.filterButtonText,
                  isActive && localStyles.filterButtonTextActive,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Event count badge */}
          <View style={localStyles.countBadge}>
            <Text style={localStyles.countBadgeText}>{filteredEventos.length}</Text>
          </View>
        </View>
      </View>

      {/* ── Map / Loading / No-location ── */}
      {loading ? (
        <View style={localStyles.centeredContainer}>
          <View style={localStyles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={localStyles.loadingText}>Carregando eventos...</Text>
            <Text style={localStyles.loadingSubtext}>Buscando seus eventos no mapa</Text>
          </View>
        </View>
      ) : (
        <OSMMapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={!!location}
          userLatitude={location?.coords.latitude}
          userLongitude={location?.coords.longitude}
          markers={markers}
          onMarkerPress={handleMarkerPress}
        />
      )}

      {/* ── Recenter button ── */}
      {!loading && location && (
        <TouchableOpacity style={localStyles.recentrarButton} onPress={recentrarMapa} activeOpacity={0.7}>
          <MaterialIcons name="my-location" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}

      {/* ── Floating legend ── */}
      {!loading && (
        <View style={localStyles.legendContainer}>
          <Text style={localStyles.legendTitle}>Legenda</Text>
          {[
            { color: COLORS.today, label: 'Hoje' },
            { color: COLORS.thisWeek, label: 'Esta semana' },
            { color: COLORS.future, label: 'Futuro (+7 dias)' },
            { color: COLORS.past, label: 'Passado' },
          ].map(item => (
            <View key={item.label} style={localStyles.legendRow}>
              <View style={[localStyles.legendDot, { backgroundColor: item.color }]} />
              <Text style={localStyles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Empty state overlay ── */}
      {!loading && filteredEventos.length === 0 && (
        <View style={localStyles.emptyOverlay}>
          <View style={localStyles.emptyCard}>
            <MaterialIcons name="event-busy" size={40} color={COLORS.textSecondary} />
            <Text style={localStyles.emptyTitle}>Nenhum evento encontrado</Text>
            <Text style={localStyles.emptySubtitle}>
              {filter === 'passados'
                ? 'Você não tem eventos passados.'
                : filter === 'futuros'
                ? 'Você não tem eventos futuros agendados.'
                : 'Crie um evento na aba Cinemas para vê-lo aqui.'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
  // Filter bar
  filterContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
  },
  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: COLORS.accent,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Loading
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    color: COLORS.textPrimary,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 13,
  },

  // Recenter button
  recentrarButton: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    backgroundColor: COLORS.accent,
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

  // Legend
  legendContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 90,
    left: 12,
    backgroundColor: 'rgba(26, 43, 62, 0.92)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(62, 156, 156, 0.25)',
  },
  legendTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  // Empty state
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 156, 156, 0.2)',
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
