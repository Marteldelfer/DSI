// aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet, Modal, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { styles } from '../../src/styles';
import { Playlist } from '../../src/models/Playlist';
import { Movie } from '../../src/models/Movie';
import { PlaylistService } from '../../src/services/PlaylistService';
import { MovieService } from '../../src/services/MovieService';
import { AntDesign } from '@expo/vector-icons';

export default function DetalhesPlaylist() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAddMovieModalVisible, setAddMovieModalVisible] = useState(false);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>([]);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [addMovieSearchTerm, setAddMovieSearchTerm] = useState('');
  const [isEditNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const router = useRouter();
  const playlistService = PlaylistService.getInstance();
  const movieService = MovieService.getInstance();

  const loadPlaylistDetails = useCallback(() => {
    if (playlistId) {
      const foundPlaylist = playlistService.getPlaylistById(playlistId);
      setPlaylist(foundPlaylist || null);
      if (foundPlaylist) {
        setMovies(playlistService.getMoviesInPlaylist(playlistId));
      }
    }
  }, [playlistId]);

  useFocusEffect(loadPlaylistDetails);

  const openAddMovieModal = () => {
    const allRatedMovies = movieService.getFilteredAndRatedMovies('all');
    const moviesNotInPlaylist = allRatedMovies.filter(m => !playlist?.movieIds.includes(m.id));
    setAvailableMovies(moviesNotInPlaylist);
    setSelectedMovieIds([]);
    setAddMovieSearchTerm('');
    setAddMovieModalVisible(true);
  };

  const handleAddMoviesToPlaylist = () => {
    if (playlistId && selectedMovieIds.length > 0) {
      playlistService.addMoviesToPlaylist(playlistId, selectedMovieIds);
      setAddMovieModalVisible(false);
      loadPlaylistDetails();
    }
  };

  const handleRemoveMovie = (movieId: string) => {
    if (playlistId) {
        const wasDeleted = playlistService.removeMovieFromPlaylist(playlistId, movieId);
        if (wasDeleted) {
            Alert.alert("Playlist Excluída", "A playlist foi excluída por não ter mais filmes.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } else {
            loadPlaylistDetails();
        }
    }
  };

  const handleOpenEditNameModal = () => {
    setNewPlaylistName(playlist?.name || '');
    setEditNameModalVisible(true);
  };

  // --- CORREÇÃO OO APLICADA AQUI ---
  const handleUpdatePlaylistName = () => {
    if (playlist && newPlaylistName.trim()) {
      // 1. Modifica a propriedade diretamente na instância da classe
      playlist.name = newPlaylistName.trim();
      
      // 2. Passa a mesma instância modificada para o serviço
      playlistService.updatePlaylist(playlist);
      
      setEditNameModalVisible(false);
      loadPlaylistDetails(); // Recarrega para mostrar o novo nome
    } else {
      Alert.alert("Erro", "O nome da playlist não pode ser vazio.");
    }
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Playlist não encontrada.</Text>
      </View>
    );
  }

  const filteredAvailableMovies = availableMovies.filter(movie => 
    movie.title.toLowerCase().includes(addMovieSearchTerm.toLowerCase())
  );

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <View style={detalhesStyles.movieItem}>
      {item.posterUrl ? <Image source={{ uri: item.posterUrl }} style={detalhesStyles.poster} /> : <View style={detalhesStyles.placeholderPoster}><Text style={detalhesStyles.placeholderText}>{item.title}</Text></View>}
      <Text style={detalhesStyles.movieTitle} numberOfLines={1}>{item.title}</Text>
      <Pressable style={detalhesStyles.removeButton} onPress={() => handleRemoveMovie(item.id)}>
        <AntDesign name="closecircle" size={24} color="#FF6347" />
      </Pressable>
    </View>
  );

  const renderSelectableMovieItem = ({ item }: { item: Movie }) => {
    const isSelected = selectedMovieIds.includes(item.id);
    return (
      <Pressable style={detalhesStyles.selectableMovieItem} onPress={() => setSelectedMovieIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}>
        {item.posterUrl ? <Image source={{ uri: item.posterUrl }} style={detalhesStyles.posterSelectable} /> : <View style={detalhesStyles.placeholderPosterSelectable}><Text style={detalhesStyles.placeholderText}>{item.title}</Text></View>}
        {isSelected && <View style={detalhesStyles.overlay}><AntDesign name="checkcircle" size={24} color="white" /></View>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={detalhesStyles.titleContainer}>
          <Text style={styles.title}>{playlist.name}</Text>
          <Pressable onPress={handleOpenEditNameModal} style={detalhesStyles.editIcon}>
              <AntDesign name="edit" size={24} color="#b0b0b0" />
          </Pressable>
      </View>

      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListEmptyComponent={<Text style={detalhesStyles.emptyText}>Esta playlist está vazia. Adicione filmes!</Text>}
      />
      <Pressable style={styles.button} onPress={openAddMovieModal}>
        <Text style={styles.buttonText}>Adicionar Filmes à Playlist</Text>
      </Pressable>

      <Modal
        visible={isEditNameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={detalhesStyles.modalBackdrop}>
            <View style={detalhesStyles.modalView}>
                <Text style={detalhesStyles.modalTitle}>Editar Nome da Playlist</Text>
                <TextInput
                    style={detalhesStyles.modalInput}
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                    placeholder="Novo nome da playlist"
                    placeholderTextColor="#b0b0b0"
                />
                <View style={detalhesStyles.modalButtonContainer}>
                    <Pressable style={[detalhesStyles.modalButton, detalhesStyles.cancelButton]} onPress={() => setEditNameModalVisible(false)}>
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </Pressable>
                    <Pressable style={[detalhesStyles.modalButton, detalhesStyles.saveButton]} onPress={handleUpdatePlaylistName}>
                        <Text style={styles.buttonText}>Salvar</Text>
                    </Pressable>
                </View>
            </View>
        </View>
      </Modal>

      <Modal
        visible={isAddMovieModalVisible}
        animationType="slide"
        onRequestClose={() => setAddMovieModalVisible(false)}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Adicionar Filmes</Text>
          <View style={[styles.textInput, { marginHorizontal: 0, marginBottom: 10 }]}>
            <AntDesign name="search1" size={20} color="#b0b0b0" />
            <TextInput style={styles.input} placeholder="Buscar filmes..." placeholderTextColor="#b0b0b0" value={addMovieSearchTerm} onChangeText={setAddMovieSearchTerm} />
          </View>
          <FlatList
            data={filteredAvailableMovies}
            renderItem={renderSelectableMovieItem}
            keyExtractor={item => item.id}
            numColumns={3}
            ListEmptyComponent={<Text style={detalhesStyles.emptyText}>Nenhum outro filme avaliado para adicionar.</Text>}
          />
          <View style={{padding: 20}}>
            <Pressable style={styles.button} onPress={handleAddMoviesToPlaylist}>
              <Text style={styles.buttonText}>Adicionar Selecionados</Text>
            </Pressable>
            <Pressable style={[styles.button, {backgroundColor: '#aa0000', marginTop: 10}]} onPress={() => setAddMovieModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const detalhesStyles = StyleSheet.create({
    movieItem: { flex: 1, margin: 10, alignItems: 'center', position: 'relative' },
    poster: { width: 150, height: 220, borderRadius: 8 },
    placeholderPoster: { width: 150, height: 220, borderRadius: 8, backgroundColor: '#1A2B3E', justifyContent: 'center', alignItems: 'center' },
    posterSelectable: { width: '100%', height: 150, borderRadius: 8 },
    placeholderPosterSelectable: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#1A2B3E', justifyContent: 'center', alignItems: 'center', padding: 5 },
    placeholderText: { color: 'white', textAlign: 'center' },
    movieTitle: { color: 'white', marginTop: 5, textAlign: 'center', width: 150 },
    removeButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 12 },
    emptyText: { color: '#b0b0b0', textAlign: 'center', marginTop: 20 },
    selectableMovieItem: { flex: 1, margin: 5, maxWidth: '31%', position: 'relative', aspectRatio: 2/3 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(62, 156, 156, 0.7)', borderRadius: 8, borderWidth: 2, borderColor: '#3E9C9C', justifyContent: 'center', alignItems: 'center' },
    titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    editIcon: { marginLeft: 10, padding: 5 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalView: { width: '85%', backgroundColor: '#2E3D50', borderRadius: 15, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#eaeaea', marginBottom: 15 },
    modalInput: { width: '100%', backgroundColor: '#1A2B3E', color: '#eaeaea', borderRadius: 8, padding: 10, marginBottom: 20, textAlign: 'center', fontSize: 16 },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#4A6B8A', marginRight: 10 },
    saveButton: { backgroundColor: '#3E9C9C' },
    // buttonText já existe em styles.ts, não precisa ser duplicado aqui
});