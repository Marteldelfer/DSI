// cole em: aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { addPlaylist, mockMovies, Movie } from '../../utils/mockData';

function CriarPlaylist() {
  const router = useRouter();
  const [playlistName, setPlaylistName] = useState('');
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectMovie = (movieId: string) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  };

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      Alert.alert('Erro', 'O nome da playlist não pode ser vazio.');
      return;
    }
    const newPlaylist = {
      id: `p${Date.now()}`,
      name: playlistName.trim(),
      movieIds: selectedMovieIds,
      coverImageUrl: selectedMovieIds.length > 0 ? mockMovies.find(m => m.id === selectedMovieIds[0])?.posterUrl : null,
    };
    addPlaylist(newPlaylist);
    Alert.alert('Sucesso', `Playlist "${playlistName}" criada!`);
    router.back();
  };

  const filteredMovies = mockMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={criarStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={criarStyles.headerTitle}>Criar Nova Playlist</Text>
      </View>

      <ScrollView contentContainerStyle={criarStyles.scrollViewContent} style={criarStyles.scrollView}>
        <TextInput
            placeholder="Nome da Playlist"
            placeholderTextColor={"#888"}
            style={criarStyles.playlistInput}
            onChangeText={setPlaylistName}
            value={playlistName}
        />
        <TextInput
            placeholder="Pesquisar filmes para adicionar"
            placeholderTextColor={"#888"}
            style={criarStyles.searchInput}
            onChangeText={setSearchQuery}
            value={searchQuery}
        />
        <View style={criarStyles.moviesGrid}>
          {filteredMovies.map(movie => (
            <Pressable key={movie.id} style={criarStyles.movieCard} onPress={() => handleSelectMovie(movie.id)}>
                <Image source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")} style={criarStyles.movieImage} />
                <Text style={criarStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                {selectedMovieIds.includes(movie.id) && (
                    <View style={criarStyles.checkbox}><AntDesign name="checkcircle" size={24} color="#3E9C9C" /></View>
                )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable style={criarStyles.createButton} onPress={handleCreatePlaylist}>
        <Text style={styles.textoBotao}>Criar Playlist</Text>
      </Pressable>

      {/* A TabBar FOI REMOVIDA DAQUI */}
    </View>
  );
}

export default CriarPlaylist;

const criarStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, backgroundColor: "#2E3D50" },
  headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", flex: 1 },
  scrollView: { flex: 1, backgroundColor: "#2E3D50" },
  scrollViewContent: { padding: 20, paddingBottom: 100 },
  playlistInput: { backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 20 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 20 },
  moviesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  movieCard: { width: '31%', marginBottom: 15, position: 'relative' },
  movieImage: { width: '100%', height: 150, borderRadius: 8 },
  movieTitle: { color: '#eaeaea', fontSize: 12, textAlign: 'center', marginTop: 5 },
  checkbox: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20 },
  createButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#3E9C9C', padding: 15, borderRadius: 30, alignItems: 'center', elevation: 5 },
});