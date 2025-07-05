// aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles'; //

// Importe as novas classes e serviços
import { Movie } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService';
import { PlaylistService } from '../../src/services/PlaylistService';

function CriarPlaylist() {
    const router = useRouter();
    const [playlistName, setPlaylistName] = useState('');
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState(''); // NOVO: Estado para o termo de pesquisa de filmes
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]); // NOVO: Estado para filmes filtrados

    const movieService = MovieService.getInstance();
    const playlistService = PlaylistService.getInstance();

    const fetchAllMovies = useCallback(() => {
        setLoading(true);
        const fetchedMovies = movieService.getAllMovies();
        setAllMovies(fetchedMovies);
        // NOVO: Inicializa filteredMovies com todos os filmes
        setFilteredMovies(fetchedMovies); 
        setLoading(false);
    }, [movieService]);

    useFocusEffect(
        useCallback(() => {
            fetchAllMovies();
        }, [fetchAllMovies])
    );

    // NOVO: Efeito para filtrar filmes quando o termo de busca ou a lista de todos os filmes muda
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm.trim()) {
                const filtered = allMovies.filter(movie =>
                    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredMovies(filtered);
            } else {
                setFilteredMovies(allMovies); // Se a busca estiver vazia, mostra todos
            }
        }, 300); // Debounce de 300ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, allMovies]);

    const toggleMovieSelection = (movieId: string) => {
        setSelectedMovieIds(prevSelected =>
            prevSelected.includes(movieId)
                ? prevSelected.filter(id => id !== movieId)
                : [...prevSelected, movieId]
        );
    };

    const handleCreatePlaylist = () => {
        if (!playlistName.trim()) {
            Alert.alert("Erro", "O nome da playlist não pode estar vazio.");
            return;
        }

        const selectedMovies = allMovies.filter(movie => selectedMovieIds.includes(movie.id));
        const coverImageUrl = selectedMovies.length > 0 ? selectedMovies[0].posterUrl : null;

        playlistService.addPlaylist(playlistName.trim(), selectedMovieIds, coverImageUrl || null);

        Alert.alert("Sucesso", `Playlist "${playlistName}" criada!`);
        router.back();
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
            <View style={criarPlaylistStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={criarPlaylistStyles.headerTitle}>Criar Nova Playlist</Text>
                <AntDesign name="delete" size={24} color="transparent" />
            </View>

            <ScrollView contentContainerStyle={criarPlaylistStyles.scrollViewContent}>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Nome da Playlist"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setPlaylistName}
                        value={playlistName}
                    />
                </View>

                <Text style={criarPlaylistStyles.sectionTitle}>Filmes Disponíveis:</Text>
                
                {/* NOVO: Barra de pesquisa de filmes */}
                <View style={criarPlaylistStyles.searchContainer}>
                    <AntDesign name="search1" size={20} color="#7f8c8d" style={criarPlaylistStyles.searchIcon} />
                    <TextInput
                        placeholder="Buscar filmes para adicionar..."
                        placeholderTextColor="#7f8c8d"
                        style={criarPlaylistStyles.searchInput}
                        onChangeText={setSearchTerm}
                        value={searchTerm}
                    />
                </View>

                {loading && searchTerm.trim() ? (
                    <ActivityIndicator size="large" color="#3E9C9C" style={{marginTop: 20}} />
                ) : filteredMovies.length > 0 ? (
                    <FlatList // Usando FlatList para melhor performance em listas de filmes
                        data={filteredMovies}
                        numColumns={3} // Exibe 3 filmes por linha
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: movie }) => (
                            <Pressable
                                key={movie.id}
                                style={[
                                    criarPlaylistStyles.movieItem,
                                    selectedMovieIds.includes(movie.id) && criarPlaylistStyles.movieItemSelected,
                                ]}
                                onPress={() => toggleMovieSelection(movie.id)}
                            >
                                {movie.posterUrl ? (
                                    <Image source={{ uri: movie.posterUrl }} style={criarPlaylistStyles.moviePoster} />
                                ) : (
                                    <View style={criarPlaylistStyles.moviePlaceholder}>
                                        <Text style={criarPlaylistStyles.moviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                                    </View>
                                )}
                                <Text style={criarPlaylistStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                                {selectedMovieIds.includes(movie.id) && (
                                    <View style={criarPlaylistStyles.checkmarkOverlay}>
                                        <AntDesign name="checkcircle" size={24} color="#3E9C9C" />
                                    </View>
                                )}
                            </Pressable>
                        )}
                        contentContainerStyle={criarPlaylistStyles.movieGrid}
                        scrollEnabled={false} // Desabilita o scroll interno para a ScrollView principal
                    />
                ) : (
                    <Text style={criarPlaylistStyles.noMoviesText}>
                        {searchTerm.trim() ? "Nenhum filme encontrado com este nome." : "Nenhum filme disponível para adicionar."}
                    </Text>
                )}

                <Pressable style={criarPlaylistStyles.createButton} onPress={handleCreatePlaylist}>
                    <Text style={styles.textoBotao}>Criar Playlist</Text>
                </Pressable>
            </ScrollView>
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
        marginLeft: 15,
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    // NOVO: Estilos da barra de pesquisa de filmes
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 20, 
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    searchIcon: {
        marginRight: 10,
        color: '#7f8c8d',
    },
    searchInput: {
        flex: 1,
        color: '#eaeaea',
        fontSize: 16,
        height: 40,
    },
    movieGrid: {
        justifyContent: 'flex-start',
        width: '100%', // Para ocupar toda a largura e permitir 3 por linha
    },
    movieItem: {
        width: '30%', // Ajustado para 3 por linha com margem
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
    checkmarkOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 2,
    },
    createButton: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    },
});