// aplicativo/app/telas/MeusFilmes.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, StyleSheet } from 'react-native';
import { useRouter, Link, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import TabBar from '../../src/componentes/TabBar';
import { styles } from '../../src/styles';

// Interface para definir o formato de uma playlist
interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null; // MUDANÇA AQUI: coverImageUrl agora pode ser string, null ou undefined
}

// MOCk dos filmes para selecionar (usaremos os mesmos da Home temporariamente)
export const mockMovies = [
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "https://image.tmdb.org/t/p/w500/A0H8A2L4k0j7Y7k9q8J6r0b3g.jpg" }, // Use uma URL válida para teste
  { id: "101", title: "Léon: The Professional", posterUrl: "https://image.tmdb.org/t/p/w500/eNPWlP6pDqM8qR2p4b5J0v5o3a.jpg" },
  { id: "102", title: "Open Hearts", posterUrl: "https://image.tmdb.org/t/p/w500/kY8p2k5s3r9i4t3i4t3i4t3i4t3i.jpg" },
  { id: "103", title: "Taxi Driver", posterUrl: "https://image.tmdb.org/t/p/w500/h2m8L5wX3n4m8n3m8n3m8n3m8n3m.jpg" },
  { id: "104", title: "Run Lola Run", posterUrl: "https://image.tmdb.org/t/p/w500/qX4r9aQ0x4r9aQ0x4r9aQ0x4r9aQ.jpg" },
  { id: "105", title: "Back to the Future", posterUrl: "https://image.tmdb.org/t/p/w500/sT00g5WqA4f3S02R3o2e3rG9k.jpg" },
  { id: "106", title: "Predator", posterUrl: "https://image.tmdb.org/t/p/w500/yQd4iF8L1jJ4Xw1g4u1d0N4S7J8.jpg" },
  { id: "107", title: "Snatch", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2Qjlnef7AM2rtPr49V19A1dL.jpg" },
  { id: "108", title: "Three Colors: Blue", posterUrl: "https://image.tmdb.org/t/p/w500/dKqg3QyRk3p6Z2aV6q8S4K1a.jpg" },
  { id: "109", title: "Three Colors: White", posterUrl: "https://image.tmdb.org/t/p/w500/1X6DqT5gVj2O2U9d6eQ6tW1s8Fk.jpg" },
];


// Simula um armazenamento local para as playlists (em memória)
let mockPlaylists: Playlist[] = [
  { id: "p1", name: "Minhas Favoritas", movieIds: ["100", "103"], coverImageUrl: mockMovies.find(m => m.id === "100")?.posterUrl },
  { id: "p2", name: "Ação e Aventura", movieIds: ["101", "105"], coverImageUrl: mockMovies.find(m => m.id === "101")?.posterUrl },
];

// Funções para manipular as playlists mockadas (simulam um mini-CRUD)
export function getPlaylists(): Playlist[] {
    return [...mockPlaylists];
}

export function addPlaylist(playlist: Playlist): void {
    mockPlaylists.push(playlist);
}

export function updatePlaylist(updatedPlaylist: Playlist): void {
    mockPlaylists = mockPlaylists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p);
}

export function deletePlaylist(playlistId: string): void {
    mockPlaylists = mockPlaylists.filter(p => p.id !== playlistId);
}

// Componente individual para exibir cada playlist na lista
function PlaylistCard({ playlist }: { playlist: Playlist }): React.JSX.Element {
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
    <Pressable style={meusFilmesStyles.playlistCard} onPress={navigateToDetails}>
      <Image source={coverImageSource} style={meusFilmesStyles.playlistImage} />
      <Text style={meusFilmesStyles.playlistName}>{playlist.name}</Text>
    </Pressable>
  );
}

function MeusFilmes(): React.JSX.Element {
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
      {/* Header */}
      <View style={meusFilmesStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={meusFilmesStyles.headerTitle}>Minhas Playlists</Text>
        {/* Campo de pesquisa de playlists */}
        <View style={[styles.textInput, meusFilmesStyles.searchInput]}>
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

      <ScrollView contentContainerStyle={meusFilmesStyles.scrollViewContent} style={meusFilmesStyles.scrollView}>
        <View style={meusFilmesStyles.playlistsGrid}>
          {filteredPlaylists.length > 0 ? (
            filteredPlaylists.map(playlist => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))
          ) : (
            <Text style={meusFilmesStyles.noPlaylistsText}>Nenhuma playlist encontrada. Crie uma!</Text>
          )}
        </View>
      </ScrollView>

      {/* Botão de Adicionar Playlist (Flutuante) */}
      <Pressable
        style={meusFilmesStyles.addPlaylistButton}
        onPress={() => router.push('/telas/CriarPlaylist')}
      >
        <AntDesign name="plus" size={30} color="#eaeaea" />
      </Pressable>

      <TabBar />
    </View>
  );
}

export default MeusFilmes;

const meusFilmesStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#2E3D50",
  },
  headerTitle: {
    color: "#eaeaea",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  searchInput: {
    flex: 1, 
    height: 40, 
    padding: 0, 
    paddingLeft: 8,
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2E3D50",
  },
  scrollViewContent: {
    padding: 10,
    paddingBottom: 70,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  playlistCard: {
    width: '45%',
    margin: 8,
    backgroundColor: '#1A2B3E',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  playlistImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  playlistName: {
    color: '#eaeaea',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  noPlaylistsText: {
    color: '#eaeaea',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    width: '100%',
  },
  addPlaylistButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#3E9C9C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
});