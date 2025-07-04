// aplicativo/app/(tabs)/MeusFilmes.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, TextInput, StyleSheet, Image, Alert // CORREÇÃO: Adicione Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';

type MovieFilterType = 'all' | 'external' | 'app_db';

function MeusFilmes() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<MovieFilterType>('all');

    const movieService = MovieService.getInstance();

    const fetchMovies = useCallback(() => {
        setRefreshing(true);
        const fetchedMovies = movieService.getFilteredAndRatedMovies(filterType);
        const filtered = fetchedMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setMovies(filtered);
        setRefreshing(false);
    }, [searchTerm, filterType, movieService]);

    useFocusEffect(
        useCallback(() => {
            fetchMovies();
        }, [fetchMovies])
    );

    const onRefresh = useCallback(() => {
        fetchMovies();
    }, [fetchMovies]);

    const handleAddMovie = () => {
        router.push("/telas/AdicionarFilmeExterno");
    };

    const navigateToMovieDetails = (movieId: string) => {
        router.push({
            pathname: `/telas/DetalhesFilme`,
            params: { movieId: movieId },
        });
    };

    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
                <Pressable onPress={handleAddMovie}>
                    <AntDesign name="pluscircleo" size={24} color="#eaeaea" />
                </Pressable>
            </View>

            <View style={meusFilmesStyles.searchContainer}> {/* CORREÇÃO: Usar meusFilmesStyles */}
                <AntDesign name="search1" size={20} color="#7f8c8d" style={meusFilmesStyles.searchIcon} /> {/* CORREÇÃO: Usar meusFilmesStyles */}
                <TextInput
                    placeholder="Buscar filmes..."
                    placeholderTextColor="#7f8c8d"
                    style={meusFilmesStyles.searchInput}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onEndEditing={fetchMovies}
                />
            </View>

            <View style={meusFilmesStyles.filterContainer}>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'all' && meusFilmesStyles.filterButtonActive]}
                    onPress={() => { setFilterType('all'); setSearchTerm(''); }}
                >
                    <Text style={meusFilmesStyles.filterButtonText}>Todos</Text>
                </Pressable>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'app_db' && meusFilmesStyles.filterButtonActive]}
                    onPress={() => { setFilterType('app_db'); setSearchTerm(''); }}
                >
                    <Text style={meusFilmesStyles.filterButtonText}>Da API</Text>
                </Pressable>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'external' && meusFilmesStyles.filterButtonActive]}
                    onPress={() => { setFilterType('external'); setSearchTerm(''); }}
                >
                    <Text style={meusFilmesStyles.filterButtonText}>Adicionados</Text>
                </Pressable>
            </View>

            <ScrollView
                style={meusFilmesStyles.movieListContainer}
                contentContainerStyle={meusFilmesStyles.movieListContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            >
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <Pressable key={movie.id} style={meusFilmesStyles.movieItem} onPress={() => navigateToMovieDetails(movie.id)}>
                            {movie.posterUrl ? (
                                <Image source={{ uri: movie.posterUrl }} style={meusFilmesStyles.moviePoster} />
                            ) : (
                                <View style={meusFilmesStyles.externalMoviePlaceholder}>
                                    <Text style={meusFilmesStyles.externalMoviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                                </View>
                            )}
                            <Text style={meusFilmesStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                            {movie.status && (
                                <AntDesign
                                    name={movie.status}
                                    size={20}
                                    color={movie.status === 'staro' ? '#FFD700' : '#3E9C9C'}
                                    style={meusFilmesStyles.movieStatusIcon}
                                />
                            )}
                        </Pressable>
                    ))
                ) : (
                    <Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado.</Text>
                )}
            </ScrollView>
        </View>
    );
}

export default MeusFilmes;

const meusFilmesStyles = StyleSheet.create({
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
    },
    // CORREÇÃO: Estilos de busca adicionados ou verificados aqui
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#eaeaea',
        fontSize: 16,
        height: 40,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 10,
        backgroundColor: "#1A2B3E",
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#4A6B8A',
    },
    filterButtonActive: {
        backgroundColor: '#3E9C9C',
    },
    filterButtonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
    },
    movieListContainer: {
        flex: 1,
        width: '100%',
    },
    movieListContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    movieItem: {
        width: 120,
        margin: 10,
        alignItems: 'center',
    },
    moviePoster: {
        width: 120,
        height: 180,
        borderRadius: 8,
        marginBottom: 5,
        resizeMode: 'cover',
    },
    externalMoviePlaceholder: {
        width: 120,
        height: 180,
        borderRadius: 8,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        paddingHorizontal: 5,
    },
    externalMoviePlaceholderText: {
        color: '#eaeaea',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 14,
        textAlign: 'center',
        height: 40,
    },
    movieStatusIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 2,
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
    },
});