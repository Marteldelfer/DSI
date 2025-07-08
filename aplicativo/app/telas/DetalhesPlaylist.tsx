// aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, Modal, TextInput, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { Playlist } from '../../src/models/Playlist';
import { Movie } from '../../src/models/Movie';
import { PlaylistService } from '../../src/services/PlaylistService';
import { MovieService } from '../../src/services/MovieService';

function DetalhesPlaylistScreen() {
    const router = useRouter();
    const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [moviesInPlaylist, setMoviesInPlaylist] = useState<Movie[]>([]);
    const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [searchMovieTerm, setSearchMovieTerm] = useState('');
    const [filteredMoviesForModal, setFilteredMoviesForModal] = useState<Movie[]>([]);

    const playlistService = PlaylistService.getInstance();
    const movieService = MovieService.getInstance();

    const fetchPlaylistDetails = useCallback(async () => {
        if (!playlistId) return;
        setLoading(true);
        try {
            const fetchedPlaylist = await playlistService.getPlaylistById(playlistId);
            setPlaylist(fetchedPlaylist || null);

            if (fetchedPlaylist) {
                setEditedName(fetchedPlaylist.name);
                setEditedDescription(fetchedPlaylist.description || '');

                if (fetchedPlaylist.movieIds.length > 0) {
                    const moviesPromises = fetchedPlaylist.movieIds.map(id => movieService.getMovieById(id));
                    const resolvedMovies = (await Promise.all(moviesPromises)).filter((m): m is Movie => m !== undefined);
                    setMoviesInPlaylist(resolvedMovies);
                } else {
                    setMoviesInPlaylist([]);
                }
            } else {
                Alert.alert("Erro", "Playlist não encontrada.", [{ text: "OK", onPress: () => router.back() }]);
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes da playlist:", error);
            Alert.alert("Erro", "Não foi possível carregar os detalhes da playlist.");
        } finally {
            setLoading(false);
        }
    }, [playlistId]);

    const fetchRatedMoviesForModal = useCallback(async () => {
        try {
            const allMovies = await movieService.getAllMovies();
            const userRatedMovies = allMovies.filter(movie => movie.status !== null);
            setRatedMovies(userRatedMovies);
        } catch (error) {
            console.error("Erro ao buscar filmes avaliados:", error);
            Alert.alert("Erro", "Não foi possível buscar seus filmes avaliados.");
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchPlaylistDetails();
    }, [fetchPlaylistDetails]));

    useEffect(() => {
        if (showAddMovieModal && ratedMovies.length === 0) {
            fetchRatedMoviesForModal();
        }

        const moviesAlreadyInPlaylist = new Set(moviesInPlaylist.map(m => m.id));
        const availableMovies = ratedMovies.filter(movie => !moviesAlreadyInPlaylist.has(movie.id));

        if (searchMovieTerm.trim() === '') {
            setFilteredMoviesForModal(availableMovies);
        } else {
            setFilteredMoviesForModal(
                availableMovies.filter(movie =>
                    movie.title.toLowerCase().includes(searchMovieTerm.toLowerCase())
                )
            );
        }
    }, [searchMovieTerm, ratedMovies, moviesInPlaylist, showAddMovieModal]);

    const handleUpdatePlaylist = async () => {
        if (!playlist || !editedName.trim()) {
            Alert.alert("Atenção", "O nome da playlist não pode ser vazio.");
            return;
        }
        try {
            await playlistService.updatePlaylist(playlist.id, {
                name: editedName.trim(),
                description: editedDescription.trim(),
            });
            Alert.alert("Sucesso", "Playlist atualizada!");
            setIsEditing(false);
            fetchPlaylistDetails();
        } catch (error) {
            console.error("Erro ao atualizar playlist:", error);
            Alert.alert("Erro", "Não foi possível atualizar a playlist.");
        }
    };

    const handleAddMovieToPlaylist = async (movieId: string) => {
        if (!playlistId) return;
        try {
            await playlistService.addMovieToPlaylist(playlistId, movieId);
            setRatedMovies(prev => prev.filter(m => m.id !== movieId));
            fetchPlaylistDetails();
        } catch (error) {
            console.error("Erro ao adicionar filme:", error);
            Alert.alert("Erro", "Não foi possível adicionar o filme.");
        }
    };

    const handleRemoveMovieFromPlaylist = (movieId: string, movieTitle: string) => {
        if (!playlistId) return;

        Alert.alert(
            "Remover Filme",
            `Remover "${movieTitle}" da playlist?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    onPress: async () => {
                        try {
                            const playlistWasDeleted = await playlistService.removeMovieFromPlaylist(playlistId, movieId);
                            if (playlistWasDeleted) {
                                Alert.alert("Playlist Excluída", "A playlist foi removida por não ter mais filmes.");
                                router.back();
                            } else {
                                fetchPlaylistDetails();
                            }
                        } catch (error) {
                            console.error("Erro ao remover filme:", error);
                            Alert.alert("Erro", "Não foi possível remover o filme.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };
    
    const handleDeletePlaylist = () => {
        if (!playlist) return;
        Alert.alert("Excluir Playlist", `Tem certeza que deseja excluir a playlist "${playlist.name}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                onPress: async () => {
                    try {
                        await playlistService.deletePlaylist(playlist.id);
                        Alert.alert("Sucesso", "Playlist excluída.");
                        router.back();
                    } catch (error) {
                        console.error("Erro ao excluir playlist:", error);
                        Alert.alert("Erro", "Não foi possível excluir a playlist.");
                    }
                },
                style: "destructive",
            },
        ]);
    };

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#3E9C9C" /></View>;
    }
    if (!playlist) {
        return <View style={styles.container}><Text style={detailsStyles.noMoviesText}>Playlist não encontrada.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={detailsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 50, zIndex: 1 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 60 }}>
                    <Text style={detailsStyles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
                </View>
                <Pressable onPress={() => setIsEditing(!isEditing)} style={detailsStyles.headerButton}>
                    <Feather name={isEditing ? "x-circle" : "edit"} size={22} color={isEditing ? "#FFC107" : "#3E9C9C"} />
                </Pressable>
                <Pressable onPress={handleDeletePlaylist} style={detailsStyles.headerButton}>
                    <Feather name="trash-2" size={22} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={detailsStyles.scrollViewContent}>
                {isEditing ? (
                    <View style={detailsStyles.editContainer}>
                        <Text style={detailsStyles.label}>Nome da Playlist</Text>
                        <TextInput
                            value={editedName}
                            onChangeText={setEditedName}
                            style={detailsStyles.inputField}
                        />
                        <Text style={detailsStyles.label}>Descrição</Text>
                        <TextInput
                            style={[detailsStyles.inputField, detailsStyles.textArea]}
                            value={editedDescription}
                            onChangeText={setEditedDescription}
                            placeholder="Descrição da playlist..."
                            placeholderTextColor="grey"
                            multiline
                        />
                        <Pressable style={detailsStyles.saveButton} onPress={handleUpdatePlaylist}>
                            <Text style={detailsStyles.saveButtonText}>Salvar Alterações</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {playlist.description ? (
                            <Text style={detailsStyles.description}>{playlist.description}</Text>
                        ) : (
                            <View style={{ marginTop: 20 }} />
                        )}

                        <Pressable style={detailsStyles.addMovieButton} onPress={() => setShowAddMovieModal(true)}>
                            <AntDesign name="pluscircleo" size={20} color="#3E9C9C" />
                            <Text style={detailsStyles.addMovieButtonText}>Adicionar Filme Avaliado</Text>
                        </Pressable>
                        
                        <Text style={detailsStyles.sectionTitle}>Filmes ({moviesInPlaylist.length})</Text>
                        
                        {moviesInPlaylist.length > 0 ? (
                            moviesInPlaylist.map(movie => (
                                <View key={movie.id} style={detailsStyles.movieItem}>
                                    <Image source={{ uri: movie.posterUrl || undefined }} style={detailsStyles.moviePoster} />
                                    <View style={detailsStyles.movieInfo}>
                                        <Text style={detailsStyles.movieTitle}>{movie.title}</Text>
                                        <Text style={detailsStyles.movieYear}>{movie.releaseYear}</Text>
                                    </View>
                                    <Pressable onPress={() => handleRemoveMovieFromPlaylist(movie.id, movie.title)} style={detailsStyles.removeMovieButton}>
                                        <Feather name="minus-circle" size={22} color="#FF6347" />
                                    </Pressable>
                                </View>
                            ))
                        ) : (
                            <Text style={detailsStyles.noMoviesText}>Esta playlist ainda não tem filmes.</Text>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={showAddMovieModal} onRequestClose={() => setShowAddMovieModal(false)}>
                <View style={detailsStyles.modalBackground}>
                    <View style={detailsStyles.modalContainer}>
                        <View style={detailsStyles.modalHeader}>
                            <Text style={detailsStyles.modalTitle}>Adicionar Filme Avaliado</Text>
                            <Pressable onPress={() => setShowAddMovieModal(false)}><AntDesign name="closecircle" size={24} color="#eaeaea" /></Pressable>
                        </View>
                        <TextInput
                            style={detailsStyles.modalSearchInput}
                            placeholder="Buscar nos seus filmes avaliados..."
                            placeholderTextColor={"grey"}
                            value={searchMovieTerm}
                            onChangeText={setSearchMovieTerm}
                        />
                        <FlatList
                            data={filteredMoviesForModal}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <Pressable style={detailsStyles.modalMovieItem} onPress={() => handleAddMovieToPlaylist(item.id)}>
                                    <Image source={{ uri: item.posterUrl || undefined }} style={detailsStyles.modalMoviePoster} />
                                    <View style={detailsStyles.modalMovieInfo}>
                                        <Text style={detailsStyles.modalMovieTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={detailsStyles.modalMovieYear}>{item.releaseYear}</Text>
                                    </View>
                                    <MaterialIcons name="add-circle-outline" size={24} color="#3E9C9C" />
                                </Pressable>
                            )}
                            ListEmptyComponent={<Text style={detailsStyles.noMoviesFoundText}>Nenhum filme avaliado para adicionar.</Text>}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
export default DetalhesPlaylistScreen;

const detailsStyles = StyleSheet.create({
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 50, 
        paddingBottom: 15, 
        backgroundColor: 'transparent', // REMOVIDO o background escuro
    },
    headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", textAlign: 'center' },
    headerButton: { padding: 5, marginLeft: 10 },
    scrollViewContent: { paddingHorizontal: 20, paddingBottom: 100 },
    description: { color: '#b0b0b0', fontSize: 15, marginVertical: 20, lineHeight: 22, fontStyle: 'italic', textAlign: 'center' },
    sectionTitle: { color: '#eaeaea', fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15, },
    addMovieButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E3D50', borderColor: '#3E9C9C', borderWidth: 1, borderRadius: 8, padding: 12, justifyContent: 'center', marginBottom: 20 },
    addMovieButtonText: { color: '#3E9C9C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    movieItem: { flexDirection: 'row', backgroundColor: '#2E3D50', borderRadius: 10, marginBottom: 10, padding: 10, alignItems: 'center', },
    moviePoster: { width: 50, height: 75, borderRadius: 5, marginRight: 15, backgroundColor: '#1A2B3E' },
    movieInfo: { flex: 1 },
    movieTitle: { color: '#eaeaea', fontSize: 16, fontWeight: 'bold' },
    movieYear: { color: '#b0b0b0', fontSize: 13, marginTop: 3 },
    removeMovieButton: { padding: 5 },
    noMoviesText: { color: '#b0b0b0', fontSize: 15, textAlign: 'center', marginTop: 30, paddingHorizontal: 20 },
    editContainer: { backgroundColor: '#2E3D50', borderRadius: 10, padding: 20, marginVertical: 20, },
    label: { color: '#eaeaea', fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
    inputField: { fontSize: 16, backgroundColor: '#1A2B3E', borderColor: '#4A6B8A', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, minHeight: 50, color: '#eaeaea', marginBottom: 15, },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 15, },
    saveButton: { backgroundColor: '#3E9C9C', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
    modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)' },
    modalContainer: { width: '95%', height: '90%', backgroundColor: '#2E3D50', borderRadius: 15, padding: 20, },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#eaeaea', fontSize: 20, fontWeight: 'bold' },
    modalSearchInput: { marginBottom: 15, backgroundColor: '#1A2B3E', borderColor: '#4A6B8A', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, height: 45, color: '#eaeaea', fontSize: 16 },
    modalMovieItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#4A6B8A' },
    modalMoviePoster: { width: 40, height: 60, borderRadius: 3, marginRight: 10, backgroundColor: '#1A2B3E' },
    modalMovieInfo: { flex: 1, marginRight: 10 },
    modalMovieTitle: { color: '#eaeaea', fontSize: 15, },
    modalMovieYear: { color: '#b0b0b0', fontSize: 12 },
    noMoviesFoundText: { color: '#b0b0b0', fontSize: 14, textAlign: 'center', marginTop: 30 },
});
