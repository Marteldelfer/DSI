// aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import TabBar from '../../src/componentes/TabBar';
import { styles } from '../../src/styles';
import { addPlaylist, mockMovies } from './MeusFilmes';

// Interface para um filme
interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
}

function CriarPlaylist(): React.JSX.Element {
  const router = useRouter();
  const [playlistName, setPlaylistName] = useState('');
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>(mockMovies);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectMovie = (movieId: string) => {
    setSelectedMovieIds(prev =>
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  };

  const handleCreatePlaylist = () => {
    if (playlistName.trim() === '') {
      Alert.alert('Erro', 'O nome da playlist não pode ser vazio.');
      return;
    }
    if (selectedMovieIds.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um filme para a playlist.');
      return;
    }

    const newPlaylistId = `p${Math.random().toString(36).substring(2, 9)}`;
    const newPlaylistCover: string | null = availableMovies.find(m => m.id === selectedMovieIds[0])?.posterUrl || null;

    addPlaylist({
      id: newPlaylistId,
      name: playlistName.trim(),
      movieIds: selectedMovieIds,
      coverImageUrl: newPlaylistCover,
    });

    Alert.alert('Sucesso', `Playlist "${playlistName}" criada com sucesso!`);
    router.back();
  };

  const filteredMovies = availableMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={criarPlaylistStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={criarPlaylistStyles.headerTitle}>Criar Nova Playlist</Text>
      </View>

      <ScrollView contentContainerStyle={criarPlaylistStyles.scrollViewContent} style={criarPlaylistStyles.scrollView}>
        {/* Input para o nome da playlist */}
        <View style={[styles.textInput, { marginBottom: 15, height: 50 }]}>
            <TextInput
                placeholder="Nome da Playlist"
                placeholderTextColor={"black"}
                style={styles.input}
                onChangeText={setPlaylistName}
                value={playlistName}
            />
        </View>

        {/* Campo de pesquisa de filmes */}
        <View style={[styles.textInput, { marginBottom: 15, height: 40, padding: 0, paddingLeft: 8 }]}>
            <AntDesign name="search1" size={20} color="black" style={{marginRight: 5}}/>
            <TextInput
                placeholder="Pesquisar filmes"
                placeholderTextColor={"black"}
                style={styles.input}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
        </View>

        <Text style={criarPlaylistStyles.sectionTitle}>Selecionar Filmes:</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }} />
        ) : (
          <View style={criarPlaylistStyles.moviesGrid}>
            {filteredMovies.length > 0 ? (
                filteredMovies.map(movie => (
                <Pressable
                    key={movie.id}
                    style={criarPlaylistStyles.movieCard}
                    onPress={() => handleSelectMovie(movie.id)}
                >
                    <Image 
                        source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")} 
                        style={criarPlaylistStyles.movieImage} 
                    />
                    <Text style={criarPlaylistStyles.movieTitle}>{movie.title}</Text>
                    <View style={criarPlaylistStyles.checkbox}>
                    {selectedMovieIds.includes(movie.id) ? (
                        <AntDesign name="checkcircle" size={24} color="#3E9C9C" />
                    ) : (
                        <AntDesign name="checkcircleo" size={24} color="#eaeaea" />
                    )}
                    </View>
                </Pressable>
                ))
            ) : (
                <Text style={criarPlaylistStyles.noMoviesText}>Nenhum filme encontrado para seleção.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Botão Inserir */}
      <Pressable style={criarPlaylistStyles.insertButton} onPress={handleCreatePlaylist}>
        <Text style={styles.textoBotao}>Inserir</Text>
      </Pressable>

      <TabBar />
    </View>
  );
}

export default CriarPlaylist;

const criarPlaylistStyles = StyleSheet.create({
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
    scrollView: {
        flex: 1,
        backgroundColor: "#2E3D50",
    },
    scrollViewContent: {
        padding: 10,
        paddingBottom: 70,
    },
    sectionTitle: {
        color: '#eaeaea',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    moviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    movieCard: {
        width: '30%',
        margin: 5,
        backgroundColor: '#1A2B3E',
        borderRadius: 8,
        alignItems: 'center',
        padding: 5,
        position: 'relative',
    },
    movieImage: {
        width: '100%',
        height: 120,
        borderRadius: 5,
        marginBottom: 5,
        resizeMode: 'cover',
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 10,
        textAlign: 'center',
        height: 30,
    },
    checkbox: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 2,
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    },
    insertButton: {
        position: 'absolute',
        bottom: 80,
        width: '90%',
        alignSelf: 'center',
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 30,
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