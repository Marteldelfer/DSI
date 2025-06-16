// cole em: aplicativo/app/telas/ListaPlaylists.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getPlaylists, Playlist, mockMovies } from '../../utils/mockData';

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  
  const coverImageSource = ((): { uri: string } | number => {
    if (typeof playlist.coverImageUrl === 'string' && playlist.coverImageUrl) {
      return { uri: playlist.coverImageUrl };
    }
    const firstMovieWithCover = mockMovies.find(m => playlist.movieIds.includes(m.id) && m.posterUrl);
    if (firstMovieWithCover && typeof firstMovieWithCover.posterUrl === 'string') {
      return { uri: firstMovieWithCover.posterUrl };
    }
    return require("../../assets/images/filmeia-logo2.png");
  })();

  const navigateToDetails = () => {
    router.push({
      pathname: `/telas/DetalhesPlaylist`,
      params: { playlistId: playlist.id, playlistName: playlist.name },
    });
  };

  return (
    <Pressable style={playlistStyles.playlistCard} onPress={navigateToDetails}>
      <Image source={coverImageSource} style={playlistStyles.playlistImage} />
      <Text style={playlistStyles.playlistName}>{playlist.name}</Text>
    </Pressable>
  );
}

function ListaPlaylists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setPlaylists(getPlaylists());
    }, [])
  );

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={playlistStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={playlistStyles.headerTitle}>Minhas Playlists</Text>
        <View style={[styles.textInput, playlistStyles.searchInput]}>
            <AntDesign name="search1" size={20} color="black" style={{marginRight: 5}}/>
            <TextInput
                placeholder="Pesquisar playlists"
                placeholderTextColor={"black"}
                style={styles.input}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
        </View>
      </View>

      <ScrollView contentContainerStyle={playlistStyles.scrollViewContent} style={playlistStyles.scrollView}>
        <View style={playlistStyles.playlistsGrid}>
          {filteredPlaylists.length > 0 ? (
            filteredPlaylists.map(playlist => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))
          ) : (
            <Text style={playlistStyles.noPlaylistsText}>Nenhuma playlist encontrada. Crie uma!</Text>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={playlistStyles.addPlaylistButton}
        onPress={() => router.push('/telas/CriarPlaylist')}
      >
        <AntDesign name="plus" size={30} color="#eaeaea" />
      </Pressable>

      {/* A TabBar FOI REMOVIDA DAQUI */}
    </View>
  );
}

export default ListaPlaylists;

const playlistStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, backgroundColor: "#2E3D50" },
  headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", flex: 1 },
  searchInput: { flex: 1, height: 40, padding: 0, paddingLeft: 8, marginLeft: 20 },
  scrollView: { flex: 1, backgroundColor: "#2E3D50" },
  scrollViewContent: { padding: 10, paddingBottom: 100 },
  playlistsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  playlistCard: { width: '45%', margin: 8, backgroundColor: '#1A2B3E', borderRadius: 10, alignItems: 'center', padding: 10 },
  playlistImage: { width: 120, height: 180, borderRadius: 8, marginBottom: 5, resizeMode: 'cover' },
  playlistName: { color: '#eaeaea', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  noPlaylistsText: { color: '#eaeaea', fontSize: 16, textAlign: 'center', marginTop: 50, width: '100%' },
  addPlaylistButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#3E9C9C', borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10 },
});