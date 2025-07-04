// aplicativo/app/(tabs)/MeusFilmes.tsx
import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    RefreshControl,
    Pressable, 
    TextInput, 
    StyleSheet, 
    Image, 
    Alert 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles'; //
import { Movie } from '../../src/models/Movie'; //
import { MovieService } from '../../src/services/MovieService';

type MovieFilterType = 'all' | 'external' | 'app_db';

function MeusFilmes() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<MovieFilterType>('all');
    const [showAddMenu, setShowAddMenu] = useState(false); // Para o botão flutuante de adicionar

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
        setShowAddMenu(false);
        router.push("/telas/AdicionarFilmeExterno");
    };

    const navigateToMovieDetails = (movie: Movie) => {
        if (movie.isTmdb) {
            router.push({
                pathname: `/telas/DetalhesFilmeTMDB`,
                params: { movieId: movie.id },
            });
        } else if (movie.isExternal) {
            router.push({
                pathname: `/telas/DetalhesFilmeExterno`,
                params: { movieId: movie.id },
            });
        } else {
            Alert.alert("Erro", "Tipo de filme desconhecido para detalhes.");
        }
    };

    const navigateToTags = (movieId: string) => {
        router.push({
            pathname: '/telas/Tags',
            params: { movieId: movieId },
        });
    };

    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
            </View>

            <View style={meusFilmesStyles.searchContainer}>
                <AntDesign name="search1" size={20} color="#7f8c8d" style={meusFilmesStyles.searchIcon} />
                <TextInput
                    placeholder="Buscar filmes avaliados..."
                    placeholderTextColor="#7f8c8d"
                    style={meusFilmesStyles.searchInput}
                    onChangeText={setSearchTerm}
                    value={searchTerm}
                    onEndEditing={fetchMovies}
                />
            </View>

            <View style={meusFilmesStyles.filterButtonsContainer}>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'all' && meusFilmesStyles.filterButtonSelected]}
                    onPress={() => { setFilterType('all'); setSearchTerm(''); }}
                >
                    <Text style={filterType === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text>
                </Pressable>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'app_db' && meusFilmesStyles.filterButtonSelected]}
                    onPress={() => { setFilterType('app_db'); setSearchTerm(''); }}
                >
                    <Text style={filterType === 'app_db' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Da API</Text>
                </Pressable>
                <Pressable
                    style={[meusFilmesStyles.filterButton, filterType === 'external' && meusFilmesStyles.filterButtonSelected]}
                    onPress={() => { setFilterType('external'); setSearchTerm(''); }}
                >
                    <Text style={filterType === 'external' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Adicionados</Text>
                </Pressable>
            </View>

            <Pressable style={{ width: '100%', marginBottom: 12, paddingHorizontal: 20}} onPress={() => router.push('/telas/ListaPlaylists')}>
                <View style={{ backgroundColor: "#3E9C9C", padding: 12, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <AntDesign name="videocamera" size={24} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                </View>
            </Pressable>


            <ScrollView
                style={meusFilmesStyles.movieListContainer}
                contentContainerStyle={meusFilmesStyles.movieListContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            >
                <View style={meusFilmesStyles.sectionContainer}>
                    <Text style={meusFilmesStyles.sectionTitle}>Filmes que você avaliou</Text>
                    <View style={meusFilmesStyles.moviesGrid}>
                        {movies.length > 0 ? (
                            movies.map(movie => (
                                <View key={movie.id} style={meusFilmesStyles.movieItem}>
                                    <Pressable onPress={() => navigateToMovieDetails(movie)}>
                                        {movie.posterUrl ? (
                                            <Image source={{ uri: movie.posterUrl }} style={meusFilmesStyles.moviePoster} />
                                        ) : (
                                            <View style={meusFilmesStyles.externalMoviePlaceholder}>
                                                <Text style={meusFilmesStyles.externalMoviePlaceholderText} numberOfLines={3}>{movie.title}</Text>
                                            </View>
                                        )}
                                        <Text style={meusFilmesStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                                        {movie.status && (
                                            <AntDesign name={movie.status} size={18} color="#FFD700" style={meusFilmesStyles.statusIconWrapper} />
                                        )}
                                    </Pressable>
                                    <View style={meusFilmesStyles.interactionIconsContainer}>
                                        <Pressable onPress={() => navigateToTags(movie.id)}>
                                            <View style={meusFilmesStyles.iconWrapper}>
                                                <AntDesign name="tags" size={20} color="black"/>
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {showAddMenu && (
                <View style={meusFilmesStyles.addMenu}>
                    <Pressable style={meusFilmesStyles.addMenuItem} onPress={handleAddMovie}>
                        <Text style={meusFilmesStyles.addMenuText}>Adicionar Filme Externo</Text>
                    </Pressable>
                </View>
            )}

            <Pressable
                style={meusFilmesStyles.plusButton}
                onPress={() => setShowAddMenu(!showAddMenu)}
            >
                <AntDesign name="plus" size={30} color="#eaeaea" />
            </Pressable>
        </View>
    );
}

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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        marginBottom: 10,
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
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '100%',
        paddingHorizontal: 20,
    },
    filterButton: {
        backgroundColor: '#1A2B3E',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    filterButtonSelected: {
        backgroundColor: '#3E9C9C',
        borderColor: '#3E9C9C',
    },
    filterButtonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
    },
    filterButtonTextSelected: {
        color: 'black',
        fontWeight: 'bold',
    },
    movieListContainer: {
        flex: 1,
        width: '100%',
    },
    movieListContent: {
        padding: 10,
        paddingBottom: 100,
    },
    sectionContainer: {
        marginTop: 24,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        color: "#eaeaea",
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 8,
    },
    moviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    movieItem: {
        width: '48%',
        marginBottom: 15,
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
    },
    moviePoster: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    externalMoviePlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    externalMoviePlaceholderText: {
        color: '#eaeaea',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    movieTitle: {
        color: "#eaeaea",
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        height: 35,
    },
    statusIconWrapper: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
        borderRadius: 15,
    },
    interactionIconsContainer: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 8,
        gap: 12,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3E9C9C",
        justifyContent: 'center',
        alignItems: 'center'
    },
    plusButton: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: '#3E9C9C',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10,
    },
    addMenu: {
        position: 'absolute',
        bottom: 160,
        right: 20,
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        elevation: 3,
        zIndex: 11,
        padding: 10,
    },
    addMenuItem: {
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    addMenuText: {
        color: '#eaeaea',
        fontSize: 16,
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    },
});

export default MeusFilmes;