// src/componentes/OSMMapView.tsx
// Componente de mapa usando OpenStreetMap + Leaflet via WebView
// Não requer chave de API do Google Maps

import React, { useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export interface OSMMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string; // hex color para o marcador
  hasEvents?: boolean;
}

export interface OSMRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface OSMMapViewProps {
  style?: any;
  initialRegion?: OSMRegion;
  showsUserLocation?: boolean;
  userLatitude?: number;
  userLongitude?: number;
  markers?: OSMMarker[];
  onMarkerPress?: (marker: OSMMarker) => void;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
}

export interface OSMMapViewRef {
  animateToRegion: (region: OSMRegion, duration?: number) => void;
}

const OSMMapView = forwardRef<OSMMapViewRef, OSMMapViewProps>((props, ref) => {
  const webviewRef = useRef<WebView | null>(null);

  const {
    style,
    initialRegion,
    showsUserLocation = false,
    userLatitude,
    userLongitude,
    markers = [],
    onMarkerPress,
    scrollEnabled = true,
    zoomEnabled = true,
  } = props;

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: OSMRegion, duration: number = 500) => {
      webviewRef.current?.injectJavaScript(`
        map.flyTo([${region.latitude}, ${region.longitude}], calculateZoom(${region.latitudeDelta}), { duration: ${duration / 1000} });
        true;
      `);
    },
  }));

  const markersJSON = useMemo(() => JSON.stringify(markers), [markers]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        const marker = markers.find(m => m.id === data.markerId);
        if (marker) onMarkerPress(marker);
      }
    } catch (e) {
      // ignore
    }
  }, [markers, onMarkerPress]);

  const lat = initialRegion?.latitude ?? -23.5505;
  const lon = initialRegion?.longitude ?? -46.6333;
  const latDelta = initialRegion?.latitudeDelta ?? 0.05;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    .custom-popup {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .custom-popup .popup-title {
      font-weight: bold;
      font-size: 14px;
      color: #1A2B3E;
      margin-bottom: 4px;
    }
    .custom-popup .popup-desc {
      font-size: 12px;
      color: #555;
    }
    .custom-popup .popup-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #E0F7F7;
      color: #3E9C9C;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 4px;
    }
    .custom-popup .popup-btn {
      display: block;
      background: #3E9C9C;
      color: white;
      text-align: center;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      margin-top: 8px;
      cursor: pointer;
      border: none;
      text-decoration: none;
    }
    .leaflet-tile-pane {
      filter: saturate(0.85) contrast(1.05);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function calculateZoom(latDelta) {
      if (latDelta <= 0.005) return 16;
      if (latDelta <= 0.01) return 15;
      if (latDelta <= 0.02) return 14;
      if (latDelta <= 0.05) return 13;
      if (latDelta <= 0.1) return 12;
      if (latDelta <= 0.2) return 11;
      return 10;
    }

    var initialZoom = calculateZoom(${latDelta});
    var map = L.map('map', {
      zoomControl: false,
      dragging: ${scrollEnabled},
      touchZoom: ${zoomEnabled},
      scrollWheelZoom: ${zoomEnabled},
      doubleClickZoom: ${zoomEnabled},
      boxZoom: ${zoomEnabled},
    }).setView([${lat}, ${lon}], initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Marcador do usuário
    ${showsUserLocation && userLatitude && userLongitude ? `
    var userIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(66,133,244,0.6);"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([${userLatitude}, ${userLongitude}], { icon: userIcon, interactive: false }).addTo(map);

    // Círculo de precisão
    L.circle([${userLatitude}, ${userLongitude}], {
      radius: 100,
      color: '#4285F4',
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      weight: 1,
    }).addTo(map);
    ` : ''}

    // Marcadores dos cinemas
    var markers = ${markersJSON};
    markers.forEach(function(m) {
      var color = m.color || (m.hasEvents ? '#3E9C9C' : '#FF6347');
      var svgIcon = L.divIcon({
        html: '<div style="position:relative;">' +
          '<svg width="30" height="40" viewBox="0 0 30 40">' +
            '<path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="' + color + '"/>' +
            '<circle cx="15" cy="14" r="6" fill="white" opacity="0.9"/>' +
          '</svg>' +
        '</div>',
        className: '',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      });

      var popupHtml = '<div class="custom-popup">' +
        '<div class="popup-title">' + m.title + '</div>' +
        (m.description ? '<div class="popup-desc">' + m.description + '</div>' : '') +
        (m.hasEvents ? '<div class="popup-badge">📅 Eventos agendados</div>' : '') +
        '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:\\'markerPress\\',markerId:\\'' + m.id + '\\'}))">✚ Criar Evento</button>' +
      '</div>';

      L.marker([m.latitude, m.longitude], { icon: svgIcon })
        .bindPopup(popupHtml, { maxWidth: 250 })
        .addTo(map);
    });
  </script>
</body>
</html>
`;

  if (Platform.OS === 'web') {
    return (
      <View style={[style, webStyles.fallback]}>
        <Text style={webStyles.fallbackText}>Mapa não suportado no navegador.</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webviewRef}
      style={style}
      source={{ html: htmlContent }}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={handleMessage}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      cacheEnabled={true}
    />
  );
});

OSMMapView.displayName = 'OSMMapView';

export default OSMMapView;

const webStyles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
  },
  fallbackText: {
    color: '#B0C4DE',
    fontSize: 16,
  },
});
