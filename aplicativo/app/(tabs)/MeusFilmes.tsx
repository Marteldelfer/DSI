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
import { styles } from '../styles';
import { Movie, MovieStatus } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService';

type MovieSourceFilter = 'all' | 'external' | 'app_db';
type ReviewStatusFilter = MovieStatus | 'all';

function MeusFilmes() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState<MovieSourceFilter>('all');
    const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('all');

    const movieService = MovieService.getInstance();

    const fetchMovies = useCallback(() => {
        setRefreshing(true);
        const fetchedMovies = movieService.getFilteredAndRatedMovies(sourceFilter, statusFilter);
        const filteredBySearch = fetchedMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setMovies(filteredBySearch);
        setRefreshing(false);
    }, [searchTerm, sourceFilter, statusFilter, movieService]);

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

    const renderMoviePoster = (movie: Movie) => {
        if (movie.posterUrl) {
            return <Image source={{ uri: movie.posterUrl }} style={meusFilmesStyles.moviePoster} />;
        } else {
            return (
                <View style={meusFilmesStyles.genericPosterPlaceholder}>
                    <Text style={meusFilmesStyles.genericPosterText} numberOfLines={2}>
                        {movie.title}
                        {movie.releaseYear ? ` (${movie.releaseYear})` : ''}
                    </Text>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
            </View>

            <View style={{paddingHorizontal: 20}}>
                <View style={meusFilmesStyles.searchContainer}>
                    <AntDesign name="search1" size={20} color="#7f8c8d" style={meusFilmesStyles.searchIcon} />
                    <TextInput
                        placeholder="Buscar filmes avaliados..."
                        placeholderTextColor="#7f8c8d"
                        style={meusFilmesStyles.searchInput}
                        onChangeText={setSearchTerm}
                        value={searchTerm}
                    />
                </View>

                <Text style={meusFilmesStyles.filterSectionTitle}>Fonte do Filme</Text>
                <View style={meusFilmesStyles.filterButtonsContainer}>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, sourceFilter === 'all' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setSourceFilter('all')}
                    >
                        <Text style={sourceFilter === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text>
                    </Pressable>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, sourceFilter === 'app_db' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setSourceFilter('app_db')}
                    >
                        <Text style={sourceFilter === 'app_db' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>TMDB</Text>
                    </Pressable>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, sourceFilter === 'external' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setSourceFilter('external')}
                    >
                        <Text style={sourceFilter === 'external' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Externos</Text>
                    </Pressable>
                </View>
                
                <Text style={meusFilmesStyles.filterSectionTitle}>Filtrar por Avaliação</Text>
                <View style={meusFilmesStyles.filterButtonsContainer}>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, statusFilter === 'all' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setStatusFilter('all')}
                    >
                        <Text style={statusFilter === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text>
                    </Pressable>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'like2' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setStatusFilter('like2')}
                    >
                        <AntDesign name="like2" size={16} color={statusFilter === 'like2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'dislike2' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setStatusFilter('dislike2')}
                    >
                        <AntDesign name="dislike2" size={16} color={statusFilter === 'dislike2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'staro' && meusFilmesStyles.filterButtonSelected]}
                        onPress={() => setStatusFilter('staro')}
                    >
                        <AntDesign name="staro" size={16} color={statusFilter === 'staro' ? 'black' : '#eaeaea'} />
                    </Pressable>
                </View>

                {/* BOTÃO DE PLAYLISTS REINSERIDO AQUI */}
                <Pressable style={{ width: '100%', marginBottom: 12}} onPress={() => router.push('/telas/ListaPlaylists')}>
                    <View style={meusFilmesStyles.playlistButton}>
                        <AntDesign name="videocamera" size={24} color="black" style={{marginRight: 10}}/>
                        <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                    </View>
                </Pressable>
            </View>


            <ScrollView
                style={meusFilmesStyles.movieListContainer}
                contentContainerStyle={{paddingBottom: 150}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            >
                <View style={meusFilmesStyles.moviesGrid}>
                    {movies.length > 0 ? (
                        movies.map(movie => (
                            <View key={movie.id} style={meusFilmesStyles.movieItem}>
                                <Pressable onPress={() => navigateToMovieDetails(movie)}>
                                    {renderMoviePoster(movie)}
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
                        <View style={meusFilmesStyles.noMoviesContainer}>
                            <Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            
            <Pressable 
                style={meusFilmesStyles.addExternalMovieFloatingButton} 
                onPress={handleAddMovie}
            >
                <AntDesign name="plus" size={20} color="black" />
            </Pressable>
        </View>
    );
}

const meusFilmesStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingHorizontal: 15,
        marginVertical: 10,
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
    filterSectionTitle: {
        color: '#b0b0b0',
        fontSize: 14,
        marginLeft: 5,
        marginBottom: 10,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    filterButton: {
        backgroundColor: '#1A2B3E',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
    },
    filterButtonSelected: {
        backgroundColor: '#3E9C9C',
        borderColor: '#3E9C9C',
    },
    filterButtonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
        fontSize: 12,
    },
    filterButtonTextSelected: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
    },
    playlistButton: {
        backgroundColor: "#3E9C9C", 
        padding: 12, 
        borderRadius: 26, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    addExternalMovieFloatingButton: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: '#3E9C9C',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        zIndex: 10,
    },
    movieListContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 10,
    },
    moviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 10,
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
    genericPosterPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    genericPosterText: {
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
    noMoviesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 50,
    },
    noMoviesText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default MeusFilmes;