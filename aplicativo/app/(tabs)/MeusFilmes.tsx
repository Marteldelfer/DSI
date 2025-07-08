// aplicativo/app/telas/MeusFilmes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { styles } from '../styles';
import { Movie, MovieStatus } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService';


type MovieSourceFilter = 'all' | 'external' | 'app_db';
type ReviewStatusFilter = MovieStatus | 'all';


function MeusFilmesScreen() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allMovies, setAllMovies] = useState<Movie[]>([]); 
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]); 
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false); 

    const [sourceFilter, setSourceFilter] = useState<MovieSourceFilter>('all');
    const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('all');


    const movieService = MovieService.getInstance();
    const auth = getAuth();

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setCurrentUser(user);
                } else {
                    setCurrentUser(null);
                    Alert.alert("Acesso Negado", "Você precisa estar logado para ver seus filmes.");
                    router.replace('/telas/Login');
                }
            });
            return () => unsubscribe();
        }, [auth, router])
    );

    const loadMovies = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const userMovies = await movieService.getFilteredAndRatedMovies('all', 'all');
            
            setAllMovies(userMovies); 
        } catch (error) {
            console.error("MeusFilmesScreen: Erro ao carregar filmes:", error);
            Alert.alert("Erro", "Não foi possível carregar seus filmes.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, movieService]); 

    useEffect(() => {
        let currentFiltered = allMovies;

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(movie =>
                movie.title.toLowerCase().includes(lowerCaseQuery) ||
                (movie.genre && movie.genre.toLowerCase().includes(lowerCaseQuery))
            );
        }

        if (sourceFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => {
                if (sourceFilter === 'external') return movie.isExternal;
                if (sourceFilter === 'app_db') return movie.isTmdb;
                return true; 
            });
        }

        if (statusFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => movie.status === statusFilter);
        }

        setFilteredMovies(currentFiltered);
    }, [allMovies, searchQuery, sourceFilter, statusFilter]); 

    useFocusEffect(
        useCallback(() => {
            if (currentUser) {
                loadMovies();
            }
        }, [currentUser, loadMovies])
    );

    const handleMoviePress = (movie: Movie) => { 
        if (movie.isTmdb) {
            router.push({ pathname: `/telas/DetalhesFilmeTMDB`, params: { movieId: movie.id } });
        } else if (movie.isExternal) {
            router.push({ pathname: `/telas/DetalhesFilmeExterno`, params: { movieId: movie.id } });
        } else {
            Alert.alert("Erro", "Tipo de filme desconhecido.");
        }
    };

    const navigateToTags = (movieId: string) => {
        router.push({ pathname: '/telas/Tags', params: { movieId: movieId } });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSourceFilter('all'); 
        setStatusFilter('all'); 
    };

    if (loading || !currentUser) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
            </View>

            <View style={meusFilmesStyles.searchFilterContainer}>
                <View style={meusFilmesStyles.searchBar}>
                    <Ionicons name="search" size={20} color="#888" style={meusFilmesStyles.searchIcon} />
                    <TextInput
                        style={meusFilmesStyles.searchInput}
                        placeholder="Buscar por título ou gênero..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <Pressable onPress={() => setShowFilters(!showFilters)} style={meusFilmesStyles.filterButton}>
                    <Ionicons name="filter" size={24} color="#eaeaea" />
                </Pressable>
            </View>

            {/* Botões de Ação */}
            <View style={meusFilmesStyles.actionButtonsContainer}>
                {/* Botão MINHAS PLAYLISTS */}
                <Pressable style={meusFilmesStyles.actionButton} onPress={() => router.push('/telas/ListaPlaylists')}>
                    <AntDesign name="menufold" size={20} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                </Pressable>
            </View>


            {showFilters && (
                <ScrollView style={meusFilmesStyles.filtersContainer} contentContainerStyle={meusFilmesStyles.filtersContent}>
                    {/* Filtros de Fonte do Filme */}
                    <Text style={meusFilmesStyles.filterSectionTitle}>Fonte do Filme:</Text>
                    <View style={meusFilmesStyles.filterOptionsRow}>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'all' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setSourceFilter('all')}
                        >
                            <Text style={meusFilmesStyles.filterOptionText}>Todos</Text>
                        </Pressable>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'app_db' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setSourceFilter('app_db')}
                        >
                            <Text style={meusFilmesStyles.filterOptionText}>TMDB</Text>
                        </Pressable>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'external' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setSourceFilter('external')}
                        >
                            <Text style={meusFilmesStyles.filterOptionText}>Manuais</Text>
                        </Pressable>
                    </View>

                    {/* Filtros de Avaliação */}
                    <Text style={meusFilmesStyles.filterSectionTitle}>Avaliação:</Text>
                    <View style={meusFilmesStyles.filterOptionsRow}>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, statusFilter === 'all' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setStatusFilter('all')}
                        >
                            <Text style={meusFilmesStyles.filterOptionText}>Todos</Text>
                        </Pressable>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, statusFilter === 'like2' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setStatusFilter('like2')}
                        >
                            <AntDesign name="like2" size={16} color={statusFilter === 'like2' ? 'black' : '#eaeaea'} />
                        </Pressable>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, statusFilter === 'dislike2' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setStatusFilter('dislike2')}
                        >
                            <AntDesign name="dislike2" size={16} color={statusFilter === 'dislike2' ? 'black' : '#eaeaea'} />
                        </Pressable>
                        <Pressable 
                            style={[meusFilmesStyles.filterOptionButton, statusFilter === 'staro' && meusFilmesStyles.filterOptionButtonSelected]} 
                            onPress={() => setStatusFilter('staro')}
                        >
                            <AntDesign name="staro" size={16} color={statusFilter === 'staro' ? 'black' : '#eaeaea'} />
                        </Pressable>
                    </View>

                    {(searchQuery !== '' || sourceFilter !== 'all' || statusFilter !== 'all') && ( 
                        <Pressable style={meusFilmesStyles.clearFiltersButton} onPress={clearFilters}>
                            <Text style={styles.textoBotao}>Limpar Filtros</Text>
                        </Pressable>
                    )}
                </ScrollView>
            )}

            <ScrollView contentContainerStyle={meusFilmesStyles.scrollViewContent}>
                {filteredMovies.length === 0 && !loading && (
                    <Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado com os filtros aplicados.</Text>
                )}
                {filteredMovies.map((movie) => (
                    <Pressable
                        key={movie.id}
                        style={meusFilmesStyles.movieCard}
                        onPress={() => handleMoviePress(movie)}
                    >
                        {movie.posterUrl ? (
                            <Image
                                source={{ uri: movie.posterUrl }}
                                style={meusFilmesStyles.moviePoster}
                            />
                        ) : (
                            <View style={meusFilmesStyles.genericPosterPlaceholder}>
                                <Text style={meusFilmesStyles.genericPosterText} numberOfLines={3}>
                                    {movie.title}
                                    {movie.releaseYear && ` (${movie.releaseYear})`}
                                </Text>
                            </View>
                        )}
                        <View style={meusFilmesStyles.movieInfo}>
                            <Text style={meusFilmesStyles.movieTitle}>{movie.title}</Text>
                            <Text style={meusFilmesStyles.movieYear}>{movie.releaseYear || 'Ano Desconhecido'}</Text>
                            {/* Exibição do status do filme (like, dislike, favorite) */}
                            {movie.status && (
                                <AntDesign 
                                    name={movie.status} 
                                    size={20} 
                                    color="#FFD700" 
                                    style={meusFilmesStyles.movieStatusIcon} 
                                />
                            )}
                            {/* Botão de Tags por filme */}
                            <Pressable style={meusFilmesStyles.tagButtonPerMovie} onPress={() => navigateToTags(movie.id)}>
                                <AntDesign name="tags" size={18} color="#eaeaea" />
                                <Text style={meusFilmesStyles.tagButtonPerMovieText}>Tags</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>

            {/* BOTÃO Adicionar Filme Externo - Flutuante */}
            <Pressable style={meusFilmesStyles.addExternalMovieButton} onPress={() => router.push('/telas/AdicionarFilmeExterno')}>
                <Text style={meusFilmesStyles.addExternalMovieButtonText}>Adicionar filme externo +</Text>
            </Pressable>
        </View>
    );
}

export default MeusFilmesScreen;

const meusFilmesStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        color: "#eaeaea",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 20,
    },
    searchFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
        width: '100%',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E3D50',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginRight: 10,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#eaeaea',
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: '#3E9C9C',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        width: 45,
    },
    actionButtonsContainer: { 
        flexDirection: 'row',
        justifyContent: 'space-around', 
        paddingHorizontal: 20,
        marginBottom: 15,
        width: '100%',
    },
    actionButton: { 
        backgroundColor: "#3E9C9C", 
        paddingVertical: 12, 
        paddingHorizontal: 15, 
        borderRadius: 26, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        flex: 1, 
        marginHorizontal: 5, 
    },
    filtersContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 15,
        maxHeight: 300, 
    },
    filtersContent: {
        paddingBottom: 10,
    },
    filterSectionTitle: {
        color: '#eaeaea',
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
    },
    filterOptionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filterOptionButton: {
        backgroundColor: '#4A6B8A',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    filterOptionButtonSelected: {
        borderColor: '#3E9C9C',
    },
    filterOptionText: {
        color: '#eaeaea',
        fontWeight: 'bold',
        fontSize: 13,
    },
    clearFiltersButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 15,
        alignSelf: 'center',
        width: '60%',
        alignItems: 'center',
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, 
    },
    movieCard: {
        flexDirection: 'row',
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        alignItems: 'center',
    },
    moviePoster: {
        width: 90,
        height: 135,
        borderRadius: 8,
        margin: 10,
        resizeMode: 'cover', 
    },
    genericPosterPlaceholder: { 
        width: 90,
        height: 135,
        borderRadius: 8,
        margin: 10,
        backgroundColor: '#1A2B3E', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5, 
    },
    genericPosterText: { 
        color: '#eaeaea',
        fontSize: 12, 
        fontWeight: 'bold',
        textAlign: 'center',
    },
    movieInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    movieYear: {
        color: '#b0b0b0',
        fontSize: 14,
    },
    movieStatusIcon: { 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        borderRadius: 15,
        padding: 5,
        zIndex: 1,
    },
    tagButtonPerMovie: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A6B8A',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    tagButtonPerMovieText: {
        color: '#eaeaea',
        fontSize: 12,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    noMoviesText: {
        color: '#b0b0b0',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
    },
    addExternalMovieButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 30,
        elevation: 8,
        zIndex: 10,
    },
    addExternalMovieButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
