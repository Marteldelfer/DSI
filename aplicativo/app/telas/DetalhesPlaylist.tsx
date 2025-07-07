// aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { Playlist } from '../../src/models/Playlist';
import { Movie } from '../../src/models/Movie';
import { PlaylistService } from '../../src/services/PlaylistService';
import { MovieService } from '../../src/services/MovieService'; 

function DetalhesPlaylistScreen() {
    const router = useRouter();
    const { playlistId } = useLocalSearchParams();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [moviesInPlaylist, setMoviesInPlaylist] = useState<Movie[]>([]);
    const [allMovies, setAllMovies] = useState<Movie[]>([]); 
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); 
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [searchMovieTerm, setSearchMovieTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

    const playlistService = PlaylistService.getInstance();
    const movieService = MovieService.getInstance();

    const fetchPlaylistDetails = useCallback(async () => {
        setLoading(true);
        if (playlistId && typeof playlistId === 'string') {
            try {
                const fetchedPlaylist = await playlistService.getPlaylistById(playlistId);
                setPlaylist(fetchedPlaylist || null);
                setEditedName(fetchedPlaylist?.name || '');
                setEditedDescription(fetchedPlaylist?.description || '');

                if (fetchedPlaylist && fetchedPlaylist.movieIds.length > 0) {
                    const moviesPromises = fetchedPlaylist.movieIds.map(id => movieService.getMovieById(id));
                    const resolvedMovies = (await Promise.all(moviesPromises)).filter(Boolean) as Movie[];
                    setMoviesInPlaylist(resolvedMovies);
                } else {
                    setMoviesInPlaylist([]);
                }

                // Busca TODOS os filmes para o modal de adição
                const fetchedAllMovies = await movieService.getAllMovies(); // CORRIGIDO: movieService.getAllMovies()
                setAllMovies(fetchedAllMovies);
                setFilteredMovies(fetchedAllMovies.filter(movie => !fetchedPlaylist?.movieIds.includes(movie.id)));
            } catch (error) {
                console.error("Erro ao carregar detalhes da playlist:", error);
                Alert.alert("Erro", "Não foi possível carregar os detalhes da playlist.");
                router.back();
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert("Erro", "ID da playlist não fornecido.");
            router.back();
            setLoading(false);
        }
    }, [playlistId, playlistService, movieService, router]);

    useFocusEffect(
        useCallback(() => {
            fetchPlaylistDetails();
        }, [fetchPlaylistDetails])
    );

    useEffect(() => {
        // Filtra filmes para o modal de adição
        if (searchMovieTerm.trim() === '') {
            setFilteredMovies(allMovies.filter(movie => !moviesInPlaylist.some(m => m.id === movie.id)));
        } else {
            setFilteredMovies(
                allMovies.filter(movie =>
                    movie.title.toLowerCase().includes(searchMovieTerm.toLowerCase()) &&
                    !moviesInPlaylist.some(m => m.id === movie.id)
                )
            );
        }
    }, [searchMovieTerm, allMovies, moviesInPlaylist]);

    const handleUpdatePlaylist = async () => {
        if (!playlist || !editedName.trim()) {
            Alert.alert("Erro", "O nome da playlist não pode ser vazio.");
            return;
        }

        try {
            await playlistService.updatePlaylist(playlist.id, {
                name: editedName.trim(),
                description: editedDescription.trim() || null, // Garante que empty string vira null no Firestore
            });
            Alert.alert("Sucesso", "Playlist atualizada com sucesso!");
            setIsEditing(false);
            fetchPlaylistDetails(); // Recarrega os dados
        } catch (error) {
            console.error("Erro ao atualizar playlist:", error);
            Alert.alert("Erro", "Não foi possível atualizar a playlist.");
        }
    };

    const handleAddMovieToPlaylist = async (movieId: string) => {
        if (!playlist) return;

        try {
            await playlistService.addMovieToPlaylist(playlist.id, movieId);
            Alert.alert("Sucesso", "Filme adicionado à playlist!");
            setShowAddMovieModal(false);
            setSearchMovieTerm('');
            fetchPlaylistDetails(); // Recarrega os dados
        } catch (error) {
            console.error("Erro ao adicionar filme:", error);
            Alert.alert("Erro", "Não foi possível adicionar o filme à playlist.");
        }
    };

    const handleRemoveMovieFromPlaylist = async (movieId: string) => {
        if (!playlist) return;

        Alert.alert("Remover Filme", "Tem certeza que deseja remover este filme da playlist?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Remover",
                onPress: async () => {
                    try {
                        const playlistWasDeleted = await playlistService.removeMovieFromPlaylist(playlist.id, movieId); // USANDO AWAIT e esperando o retorno boolean
                        if (playlistWasDeleted) { // AGORA PODE TESTAR POR TRUTHINESS
                            Alert.alert("Sucesso", "Playlist excluída por ficar vazia.");
                            router.back(); // Volta para a lista de playlists
                        } else {
                            Alert.alert("Sucesso", "Filme removido da playlist!");
                            fetchPlaylistDetails(); // Recarrega os dados
                        }
                    } catch (error) {
                        console.error("Erro ao remover filme:", error);
                        Alert.alert("Erro", "Não foi possível remover o filme da playlist.");
                    }
                },
                style: "destructive",
            },
        ]);
    };

    const handleDeletePlaylist = async () => {
        if (!playlist) return;

        Alert.alert(
            "Excluir Playlist",
            `Tem certeza que deseja excluir a playlist "${playlist.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await playlistService.deletePlaylist(playlist.id);
                            Alert.alert("Sucesso", "Playlist excluída com sucesso!");
                            router.back(); // Volta para a lista de playlists
                        } catch (error) {
                            console.error("Erro ao excluir playlist:", error);
                            Alert.alert("Erro", "Não foi possível excluir a playlist.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    if (loading || !playlist) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
                <Text style={{ color: '#eaeaea', marginTop: 10 }}>Carregando detalhes da playlist...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={detailsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={detailsStyles.headerTitle} numberOfLines={1}>
                    {playlist.name}
                </Text>
                <Pressable onPress={() => setIsEditing(!isEditing)} style={detailsStyles.editButton}>
                    <Feather name="edit" size={22} color="#3E9C9C" />
                </Pressable>
                <Pressable onPress={handleDeletePlaylist} style={detailsStyles.deleteButton}>
                    <Feather name="trash-2" size={22} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={detailsStyles.scrollViewContent}>
                {isEditing ? (
                    <View style={detailsStyles.editContainer}>
                        <Text style={detailsStyles.label}>Nome da Playlist:</Text>
                        <TextInput
                            style={[styles.input, detailsStyles.inputField]}
                            value={editedName}
                            onChangeText={setEditedName}
                        />
                        <Text style={detailsStyles.label}>Descrição:</Text>
                        <TextInput
                            style={[styles.input, detailsStyles.inputField, detailsStyles.textArea]}
                            value={editedDescription}
                            onChangeText={setEditedDescription}
                            multiline
                            numberOfLines={4}
                        />
                        <Pressable style={detailsStyles.saveButton} onPress={handleUpdatePlaylist}>
                            <Text style={detailsStyles.saveButtonText}>Salvar Alterações</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {playlist.description && (
                            <Text style={detailsStyles.description}>{playlist.description}</Text>
                        )}

                        <Text style={detailsStyles.sectionTitle}>Filmes na Playlist ({moviesInPlaylist.length}):</Text>
                        
                        <Pressable style={detailsStyles.addMovieButton} onPress={() => setShowAddMovieModal(true)}>
                            <AntDesign name="pluscircleo" size={20} color="#3E9C9C" />
                            <Text style={detailsStyles.addMovieButtonText}>Adicionar Filme</Text>
                        </Pressable>

                        {moviesInPlaylist.length > 0 ? (
                            moviesInPlaylist.map(movie => (
                                <View key={movie.id} style={detailsStyles.movieItem}>
                                    <Image
                                        source={{ uri: movie.posterUrl || 'https://via.placeholder.com/150' }}
                                        style={detailsStyles.moviePoster}
                                    />
                                    <View style={detailsStyles.movieInfo}>
                                        <Text style={detailsStyles.movieTitle}>{movie.title}</Text>
                                        <Text style={detailsStyles.movieYear}>{movie.releaseYear}</Text>
                                    </View>
                                    <Pressable onPress={() => handleRemoveMovieFromPlaylist(movie.id)} style={detailsStyles.removeMovieButton}>
                                        <Feather name="minus-circle" size={22} color="#FF6347" />
                                    </Pressable>
                                </View>
                            ))
                        ) : (
                            <Text style={detailsStyles.noMoviesText}>Nenhum filme nesta playlist ainda.</Text>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Modal para Adicionar Filme */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddMovieModal}
                onRequestClose={() => setShowAddMovieModal(false)}
            >
                <View style={detailsStyles.modalBackground}>
                    <View style={detailsStyles.modalContainer}>
                        <View style={detailsStyles.modalHeader}>
                            <Text style={detailsStyles.modalTitle}>Adicionar Filme à Playlist</Text>
                            <Pressable onPress={() => setShowAddMovieModal(false)}>
                                <AntDesign name="closecircleo" size={24} color="#eaeaea" />
                            </Pressable>
                        </View>
                        <TextInput
                            style={[styles.input, detailsStyles.modalSearchInput]}
                            placeholder="Buscar filme..."
                            placeholderTextColor={"grey"}
                            value={searchMovieTerm}
                            onChangeText={setSearchMovieTerm}
                        />
                        <ScrollView style={detailsStyles.modalMovieList}>
                            {filteredMovies.length > 0 ? (
                                filteredMovies.map(movie => (
                                    <Pressable
                                        key={movie.id}
                                        style={detailsStyles.modalMovieItem}
                                        onPress={() => handleAddMovieToPlaylist(movie.id)}
                                    >
                                        <Image
                                            source={{ uri: movie.posterUrl || 'https://via.placeholder.com/100' }}
                                            style={detailsStyles.modalMoviePoster}
                                        />
                                        <View style={detailsStyles.modalMovieInfo}>
                                            <Text style={detailsStyles.modalMovieTitle}>{movie.title}</Text>
                                            <Text style={detailsStyles.modalMovieYear}>{movie.releaseYear}</Text>
                                        </View>
                                        <MaterialIcons name="add-circle-outline" size={24} color="#3E9C9C" />
                                    </Pressable>
                                ))
                            ) : (
                                <Text style={detailsStyles.noMoviesFoundText}>Nenhum filme encontrado ou todos já estão na playlist.</Text>
                            )}
                        </ScrollView>
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
        justifyContent: 'space-between',
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
        marginLeft: 15,
    },
    editButton: {
        padding: 5,
        marginLeft: 10,
    },
    deleteButton: {
        padding: 5,
        marginLeft: 10,
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
    },
    description: {
        color: '#b0b0b0',
        fontSize: 15,
        marginBottom: 20,
        lineHeight: 22,
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 15,
    },
    addMovieButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderColor: '#3E9C9C',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        marginBottom: 20,
    },
    addMovieButtonText: {
        color: '#3E9C9C',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    movieItem: {
        flexDirection: 'row',
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        marginBottom: 15,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    moviePoster: {
        width: 60,
        height: 90,
        borderRadius: 5,
        marginRight: 10,
    },
    movieInfo: {
        flex: 1,
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    movieYear: {
        color: '#b0b0b0',
        fontSize: 13,
        marginTop: 3,
    },
    removeMovieButton: {
        padding: 5,
    },
    noMoviesText: {
        color: '#b0b0b0',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 20,
    },
    editContainer: {
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    label: {
        color: '#eaeaea',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputField: {
        marginBottom: 15,
        backgroundColor: 'transparent',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        color: '#eaeaea',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 10,
    },
    saveButton: {
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '90%',
        height: '80%',
        backgroundColor: '#2E3D50',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        color: '#eaeaea',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalSearchInput: {
        marginBottom: 15,
        backgroundColor: '#1A2B3E',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45,
        color: '#eaeaea',
    },
    modalMovieList: {
        flex: 1,
    },
    modalMovieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    modalMoviePoster: {
        width: 40,
        height: 60,
        borderRadius: 3,
        marginRight: 10,
    },
    modalMovieInfo: {
        flex: 1,
    },
    modalMovieTitle: {
        color: '#eaeaea',
        fontSize: 15,
        fontWeight: 'bold',
    },
    modalMovieYear: {
        color: '#b0b0b0',
        fontSize: 12,
    },
    noMoviesFoundText: {
        color: '#b0b0b0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});