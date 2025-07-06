// aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../src/styles';
import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
import { PlaylistService } from '../../src/services/PlaylistService';
import { AntDesign } from '@expo/vector-icons';

export default function CriarPlaylist() {
  const [playlistName, setPlaylistName] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // NOVO: Estado para controlar o texto da busca
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const movieService = MovieService.getInstance();
  const playlistService = PlaylistService.getInstance();

  useEffect(() => {
    setLoading(true);
    const allRatedMovies = movieService.getFilteredAndRatedMovies('all');
    setMovies(allRatedMovies);
    setLoading(false);
  }, []);

  const handleToggleMovie = (movieId: string) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      Alert.alert('Erro', 'O nome da playlist não pode estar vazio.');
      return;
    }
    if (selectedMovieIds.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um filme para a playlist.');
      return;
    }
    
    const selectedMovies = movies.filter(movie => selectedMovieIds.includes(movie.id));
    const coverImageUrl = selectedMovies.length > 0 ? selectedMovies[0].posterUrl : null;

    playlistService.createPlaylist(playlistName, selectedMovieIds, coverImageUrl);
    Alert.alert('Sucesso', 'Playlist criada com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  // NOVO: Filtra os filmes com base no termo de busca
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const isSelected = selectedMovieIds.includes(item.id);
    return (
      <Pressable style={playlistStyles.movieItem} onPress={() => handleToggleMovie(item.id)}>
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={playlistStyles.poster} />
        ) : (
          <View style={playlistStyles.placeholderPoster}>
            <Text style={playlistStyles.placeholderText}>{item.title}</Text>
          </View>
        )}
        <View style={playlistStyles.movieInfo}>
          <Text style={playlistStyles.movieTitle} numberOfLines={2}>{item.title}</Text>
        </View>
        {isSelected && (
          <View style={playlistStyles.overlay}>
             <AntDesign name="checkcircle" size={24} color="white" />
          </View>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3E9C9C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Playlist</Text>
      <View style={styles.textInput}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Playlist"
          placeholderTextColor="#b0b0b0"
          value={playlistName}
          onChangeText={setPlaylistName}
        />
      </View>

      {/* NOVO: Barra de pesquisa de filmes */}
      <View style={styles.textInput}>
        <AntDesign name="search1" size={20} color="#b0b0b0" />
        <TextInput
          style={styles.input}
          placeholder="Buscar filmes avaliados..."
          placeholderTextColor="#b0b0b0"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <Text style={styles.subtitle}>Selecione os filmes:</Text>
      <FlatList
        // MODIFICADO: Usa a lista de filmes filtrada
        data={filteredMovies}
        renderItem={renderMovieItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={<Text style={{color: '#b0b0b0', textAlign: 'center', marginTop: 20}}>Nenhum filme encontrado.</Text>}
      />
      <Pressable style={[styles.button, { position: 'absolute', bottom: 40, left: 20, right: 20 }]} onPress={handleCreatePlaylist}>
        <Text style={styles.buttonText}>Criar Playlist</Text>
      </Pressable>
    </View>
  );
}

const playlistStyles = StyleSheet.create({
  movieItem: { flex: 1, margin: 5, position: 'relative', maxWidth: '31%', aspectRatio: 2/3 },
  poster: { width: '100%', height: '100%', borderRadius: 8 },
  placeholderPoster: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#1A2B3E', justifyContent: 'center', alignItems: 'center', padding: 5 },
  placeholderText: { color: 'white', fontSize: 12, textAlign: 'center' },
  movieInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 5, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  movieTitle: { color: 'white', fontSize: 10, textAlign: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(62, 156, 156, 0.7)', borderRadius: 8, borderWidth: 2, borderColor: '#3E9C9C', justifyContent: 'center', alignItems: 'center' },
});