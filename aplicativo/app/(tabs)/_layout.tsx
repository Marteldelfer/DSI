import React from 'react';
import { Tabs } from 'expo-router';
import { AntDesign, Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3E9C9C',
        tabBarInactiveTintColor: '#eaeaea',
        tabBarStyle: { backgroundColor: '#1A2B3E', borderTopWidth: 0, paddingTop: 5, height: 60, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 9, marginTop: -5, marginBottom: 5 }
      }}>
      <Tabs.Screen name="Home" options={{ title: 'Recomendações', tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="MeusFilmes" options={{ title: 'Meus Filmes', tabBarIcon: ({ color }) => <AntDesign name="videocamera" size={24} color={color} /> }} />
      <Tabs.Screen name="Cinemas" options={{ title: 'Cinemas', tabBarIcon: ({ color }) => <Entypo name="map" size={24} color={color} /> }} />
      <Tabs.Screen name="MapaEventos" options={{ title: 'Eventos', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={26} color={color} /> }} />
      <Tabs.Screen name="Diario" options={{ title: 'Diário', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book-open-page-variant" size={26} color={color} /> }} />
      <Tabs.Screen name="Perfil" options={{ title: 'Perfil', tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color={color} /> }} />
    </Tabs>
  );
}