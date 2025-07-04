// aplicativo/app/telas/DetalhesPlaylist.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';

// Importe as novas classes e serviços
import { Playlist } from '../../src/models/Playlist';
import { Movie } from '../../src/models/Movie';
import { PlaylistService } from '../../src/services/PlaylistService';
import { MovieService } from '../../src/services/MovieService';

function DetalhesPlaylist() {
    const router = useRouter();
    const { playlistId } = useLocalSearchParams();

    const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
    const [editableName, setEditableName] = useState('');
    const [moviesInPlaylist, setMoviesInPlaylist] = useState<Movie[]>([]);
    const [allAvailableMovies, setAllAvailableMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const playlistService = PlaylistService.getInstance();
    const movieService = MovieService.getInstance();

    const fetchPlaylistData = useCallback(() => {
        setLoading(true);
        if (playlistId) {
            const foundPlaylist = playlistService.getPlaylistById(playlistId as string);
            if (foundPlaylist) {
                setPlaylist(foundPlaylist);
                setEditableName(foundPlaylist.name);
                const movies = playlistService.getMoviesInPlaylist(foundPlaylist.id);
                setMoviesInPlaylist(movies);

                const allMovies = movieService.getAllMovies();
                setAllAvailableMovies(allMovies);
            } else {
                Alert.alert("Erro", "Playlist não encontrada.");
                router.back();
            }
        }
        setLoading(false);
    }, [playlistId, playlistService, movieService]);

    useFocusEffect(
        useCallback(() => {
            fetchPlaylistData();
        }, [fetchPlaylistData])
    );

    const handleUpdatePlaylistName = () => {
        if (!playlist || !editableName.trim()) {
            Alert.alert("Erro", "O nome da playlist não pode estar vazio.");
            return;
        }
        // CORREÇÃO: Instanciar a classe Playlist
        const updatedPlaylist = new Playlist({ ...playlist, name: editableName.trim() });
        playlistService.updatePlaylist(updatedPlaylist);
        setPlaylist(updatedPlaylist);
        Alert.alert("Sucesso", "Nome da playlist atualizado!");
    };

    const handleDeletePlaylist = () => {
        if (!playlist) return;
        Alert.alert(
            "Excluir Playlist",
            `Tem certeza que deseja excluir a playlist "${playlist.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: () => {
                        playlistService.deletePlaylist(playlist.id);
                        Alert.alert("Sucesso", "Playlist excluída!");
                        router.back();
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const toggleMovieInPlaylist = (movieId: string) => {
        if (!playlist) return;

        const updatedMovieIds = new Set(playlist.movieIds);
        if (updatedMovieIds.has(movieId)) {
            updatedMovieIds.delete(movieId);
        } else {
            updatedMovieIds.add(movieId);
        }

        // CORREÇÃO: Instanciar a classe Playlist
        const newPlaylist = new Playlist({
            ...playlist,
            movieIds: Array.from(updatedMovieIds),
        });

        if (newPlaylist.movieIds.length > 0) {
            const firstMoviePromise = movieService.getMovieById(newPlaylist.movieIds[0]);
            firstMoviePromise.then(m => {
                if (m) newPlaylist.coverImageUrl = m.posterUrl;
                else newPlaylist.coverImageUrl = null;
                playlistService.updatePlaylist(newPlaylist);
                setPlaylist(newPlaylist);
                setMoviesInPlaylist(playlistService.getMoviesInPlaylist(newPlaylist.id));
            });
        } else {
            newPlaylist.coverImageUrl = null;
            playlistService.updatePlaylist(newPlaylist);
            setPlaylist(newPlaylist);
            setMoviesInPlaylist([]);
        }
    };

    if (loading || !playlist) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={detalhesPlaylistStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={detalhesPlaylistStyles.headerTitle} numberOfLines={1}>
                    {playlist.name}
                </Text>
                <Pressable onPress={handleDeletePlaylist}>
                    <AntDesign name="delete" size={24} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={detalhesPlaylistStyles.scrollViewContent}>
                <Image
                    source={playlist.coverImageUrl ? { uri: playlist.coverImageUrl } : require('../../assets/images/filmeia-logo2.png')}
                    style={detalhesPlaylistStyles.playlistCover}
                />

                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Nome da Playlist"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setEditableName}
                        value={editableName}
                        onEndEditing={handleUpdatePlaylistName}
                    />
                </View>

                <Text style={detalhesPlaylistStyles.sectionTitle}>Filmes na Playlist:</Text>
                {moviesInPlaylist.length > 0 ? (
                    <View style={detalhesPlaylistStyles.movieGrid}>
                        {moviesInPlaylist.map((movie) => (
                            <Pressable
                                key={movie.id}
                                style={detalhesPlaylistStyles.movieItem}
                                onPress={() => toggleMovieInPlaylist(movie.id)}
                            >
                                {movie.posterUrl ? (
                                    <Image source={{ uri: movie.posterUrl }} style={detalhesPlaylistStyles.moviePoster} />
                                ) : (
                                    <View style={detalhesPlaylistStyles.moviePlaceholder}>
                                        <Text style={detalhesPlaylistStyles.moviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                                    </View>
                                )}
                                <Text style={detalhesPlaylistStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                                <View style={detalhesPlaylistStyles.removeIconOverlay}>
                                    <AntDesign name="minuscircle" size={24} color="#FF6347" />
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <Text style={detalhesPlaylistStyles.noMoviesText}>Nenhum filme nesta playlist.</Text>
                )}

                <Text style={detalhesPlaylistStyles.sectionTitle}>Adicionar/Remover Filmes:</Text>
                <View style={detalhesPlaylistStyles.movieGrid}>
                    {allAvailableMovies.length > 0 ? (
                        allAvailableMovies.map((movie) => (
                            <Pressable
                                key={movie.id}
                                style={[
                                    detalhesPlaylistStyles.movieItem,
                                    playlist.movieIds.includes(movie.id) && detalhesPlaylistStyles.movieItemSelected,
                                ]}
                                onPress={() => toggleMovieInPlaylist(movie.id)}
                            >
                                {movie.posterUrl ? (
                                    <Image source={{ uri: movie.posterUrl }} style={detalhesPlaylistStyles.moviePoster} />
                                ) : (
                                    <View style={detalhesPlaylistStyles.moviePlaceholder}>
                                        <Text style={detalhesPlaylistStyles.moviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                                    </View>
                                )}
                                <Text style={detalhesPlaylistStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                                {playlist.movieIds.includes(movie.id) ? (
                                    <View style={detalhesPlaylistStyles.checkmarkOverlay}>
                                        <AntDesign name="checkcircle" size={24} color="#3E9C9C" />
                                    </View>
                                ) : (
                                    <View style={detalhesPlaylistStyles.addIconOverlay}>
                                        <AntDesign name="pluscircle" size={24} color="#eaeaea" />
                                    </View>
                                )}
                            </Pressable>
                        ))
                    ) : (
                        <Text style={detalhesPlaylistStyles.noMoviesText}>Nenhum filme disponível para gerenciar.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

export default DetalhesPlaylist;

const detalhesPlaylistStyles = StyleSheet.create({
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
        marginHorizontal: 15,
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    playlistCover: {
        width: 150,
        height: 225,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
        alignSelf: 'flex-start',
        width: '100%',
    },
    movieGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
    },
    movieItem: {
        width: '30%',
        margin: '1.5%',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#1A2B3E',
        borderRadius: 8,
        paddingBottom: 5,
    },
    movieItemSelected: {
        borderColor: '#3E9C9C',
        borderWidth: 3,
    },
    moviePoster: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    moviePlaceholder: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    moviePlaceholderText: {
        color: '#eaeaea',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        minHeight: 30,
    },
    removeIconOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 2,
    },
    checkmarkOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 2,
    },
    addIconOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 2,
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    },
});