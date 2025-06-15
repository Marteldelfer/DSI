// aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import TabBar from '../../src/componentes/TabBar';
import { styles } from '../../src/styles';
import { getPlaylists, updatePlaylist, deletePlaylist, mockMovies } from './MeusFilmes';

// Interfaces (repetidas aqui para clareza no arquivo, em um projeto maior seriam importadas de um arquivo de tipos comum)
interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
}

interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null; // coverImageUrl agora aceita null
}

function DetalhesPlaylist(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const playlistId = params.playlistId as string;
  const playlistNameParam = params.playlistName as string; 

  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [playlistMovies, setPlaylistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [moviesToDelete, setMoviesToDelete] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    const foundPlaylist = getPlaylists().find(p => p.id === playlistId);
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      const moviesInThisPlaylist = mockMovies.filter(movie =>
        foundPlaylist.movieIds.includes(movie.id)
      );
      setPlaylistMovies(moviesInThisPlaylist);
    } else {
      Alert.alert('Erro', 'Playlist não encontrada.');
      router.back();
    }
    setLoading(false);
  }, [playlistId, router]);

  const handleToggleEditMode = () => {
    setIsEditing(prev => !prev);
    setMoviesToDelete([]);
  };

  const handleSelectMovieToDelete = (movieId: string) => {
    setMoviesToDelete(prev =>
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  };

  const handleDeleteSelectedMovies = () => {
    if (moviesToDelete.length === 0) {
      Alert.alert('Aviso', 'Nenhum filme selecionado para excluir.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${moviesToDelete.length} filme(s) da playlist "${playlist?.name || playlistNameParam}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => confirmDeleteMovies() },
      ]
    );
  };

  const confirmDeleteMovies = () => {
    if (playlist) {
      const updatedMovieIds = playlist.movieIds.filter(id => !moviesToDelete.includes(id));
      const updatedPlaylist = { ...playlist, movieIds: updatedMovieIds };

      updatePlaylist(updatedPlaylist);
      setPlaylist(updatedPlaylist);

      setPlaylistMovies(mockMovies.filter(movie => updatedMovieIds.includes(movie.id)));
      setMoviesToDelete([]);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Filme(s) excluído(s) da playlist.');

      if (updatedMovieIds.length === 0) {
          Alert.alert('Aviso', 'A playlist ficou vazia. Considere excluí-la.', [
              { text: 'OK' },
              { text: 'Excluir Playlist', onPress: () => handleDeletePlaylistConfirm() }
          ]);
      }
    }
  };

  const handleDeletePlaylistConfirm = () => {
    Alert.alert(
      'Excluir Playlist',
      `Tem certeza que deseja excluir a playlist "${playlist?.name || playlistNameParam}"? Essa ação é irreversível.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: () => {
            if (playlist) {
                deletePlaylist(playlist.id);
                Alert.alert('Sucesso', 'Playlist excluída.');
                router.back();
            }
        }},
      ]
    );
  };


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3E9C9C" />
        <Text style={{ color: "#eaeaea", marginTop: 10 }}>Carregando playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red", textAlign: 'center', marginTop: 50 }}>Playlist não encontrada.</Text>
        <TabBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header da tela de detalhes da playlist */}
      <View style={detalhesPlaylistStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesPlaylistStyles.headerTitle}>{playlist.name}</Text>
        
        {/* Botão de Excluir Playlist Inteira */}
        <Pressable onPress={handleDeletePlaylistConfirm} style={{marginRight: 10}}>
            <AntDesign name="delete" size={24} color="#FF6347" />
        </Pressable>

        {/* Botão de Ativar/Desativar modo de edição (seleção de exclusão) */}
        <Pressable onPress={handleToggleEditMode}>
          <AntDesign name={isEditing ? "checkcircleo" : "minuscircleo"} size={24} color="#eaeaea" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={detalhesPlaylistStyles.scrollViewContent} style={detalhesPlaylistStyles.scrollView}>
        <View style={detalhesPlaylistStyles.moviesGrid}>
          {playlistMovies.length > 0 ? (
            playlistMovies.map(movie => (
              <Pressable
                key={movie.id}
                style={detalhesPlaylistStyles.movieCard}
                onPress={() => isEditing && handleSelectMovieToDelete(movie.id)}
              >
                <Image 
                    source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")} 
                    style={detalhesPlaylistStyles.movieImage} 
                />
                <Text style={detalhesPlaylistStyles.movieTitle}>{movie.title}</Text>
                <View style={detalhesPlaylistStyles.checkbox}>
                    {moviesToDelete.includes(movie.id) ? (
                      <AntDesign name="checkcircle" size={24} color="#FF6347" />
                    ) : (
                      <AntDesign name="checkcircleo" size={24} color="#eaeaea" />
                    )}
                  </View>
              </Pressable>
            ))
          ) : (
            <Text style={detalhesPlaylistStyles.noMoviesText}>Esta playlist está vazia. Adicione filmes!</Text>
          )}
        </View>
        {isEditing && moviesToDelete.length > 0 && (
            <Pressable style={detalhesPlaylistStyles.deleteSelectedButton} onPress={handleDeleteSelectedMovies}>
                <Text style={styles.textoBotao}>Excluir Selecionados ({moviesToDelete.length})</Text>
            </Pressable>
        )}
      </ScrollView>

      <TabBar />
    </View>
  );
}

export default DetalhesPlaylist;

const detalhesPlaylistStyles = StyleSheet.create({
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
    deleteSelectedButton: {
        backgroundColor: '#FF6347',
        padding: 15,
        borderRadius: 30,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 10,
    },
});