// cole em: aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getPlaylists, updatePlaylist, deletePlaylist, mockMovies, Movie, Playlist } from '../../utils/mockData';

function DetalhesPlaylist() {
  const router = useRouter();
  const { playlistId } = useLocalSearchParams();

  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [playlistMovies, setPlaylistMovies] = useState<Movie[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const foundPlaylist = getPlaylists().find(p => p.id === playlistId);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setPlaylistMovies(mockMovies.filter(movie => foundPlaylist.movieIds.includes(movie.id)));
      }
    }, [playlistId])
  );

  const handleDeletePlaylist = () => {
    Alert.alert(
      "Excluir Playlist",
      `Tem certeza que deseja excluir a playlist "${playlist?.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => {
            if(playlistId) {
                deletePlaylist(playlistId as string);
                router.back();
            }
        }, style: "destructive" }
      ]
    );
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>Playlist não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={detalhesStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesStyles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
        <Pressable onPress={handleDeletePlaylist}>
          <AntDesign name="delete" size={24} color="#FF6347" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {playlistMovies.length > 0 ? (
          <View style={detalhesStyles.moviesGrid}>
            {playlistMovies.map(movie => (
              <View key={movie.id} style={detalhesStyles.movieCard}>
                <Image source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")} style={detalhesStyles.movieImage} />
                <Text style={detalhesStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={detalhesStyles.noMoviesText}>Esta playlist está vazia.</Text>
        )}
      </ScrollView>

       {/* A TabBar FOI REMOVIDA DAQUI */}
    </View>
  );
}

export default DetalhesPlaylist;

const detalhesStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, backgroundColor: "#2E3D50" },
  headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", flex: 1, marginHorizontal: 15 },
  moviesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 },
  movieCard: { width: '31%', marginBottom: 15 },
  movieImage: { width: '100%', height: 150, borderRadius: 8 },
  movieTitle: { color: '#eaeaea', fontSize: 12, textAlign: 'center', marginTop: 5 },
  noMoviesText: { color: '#eaeaea', fontSize: 16, textAlign: 'center', marginTop: 50 },
});