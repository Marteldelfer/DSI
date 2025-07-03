// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Alert } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3E9C9C',
        tabBarInactiveTintColor: '#eaeaea',
        tabBarStyle: { backgroundColor: '#1A2B3E', borderTopWidth: 0, paddingTop: 5, height: 60, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 10, marginTop: -5, marginBottom: 5 }
      }}>
      <Tabs.Screen name="Home" options={{ title: 'Recomendações', tabBarIcon: ({ color }) => <AntDesign name="home" size={28} color={color} /> }} />
      <Tabs.Screen name="MeusFilmes" options={{ title: 'Meus Filmes', tabBarIcon: ({ color }) => <AntDesign name="videocamera" size={28} color={color} /> }} />
      <Tabs.Screen
        name="Cinemas"
        //listeners={() => ({ tabPress: (e) => { e.preventDefault(); Alert.alert("Em Breve!", "Funcionalidade não implementada."); } })}
        options={{ title: 'Cinemas', tabBarIcon: ({ color }) => <Entypo name="map" size={28} color={color} /> }}
      />
      <Tabs.Screen name="Perfil" options={{ title: 'Perfil', tabBarIcon: ({ color }) => <AntDesign name="user" size={28} color={color} /> }} />
    </Tabs>
  );
}