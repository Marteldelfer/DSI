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
    Alert,
    ActivityIndicator 
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
    const [loadingInitial, setLoadingInitial] = useState(true);

    const movieService = MovieService.getInstance();

    const fetchMovies = useCallback(async () => {
        setRefreshing(true);
        try {
            const fetchedMovies = await movieService.getFilteredAndRatedMovies(sourceFilter, statusFilter);
            const filteredBySearch = fetchedMovies.filter(movie =>
                movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setMovies(filteredBySearch);
        } catch (error) {
            console.error("Erro ao buscar filmes em MeusFilmes:", error);
            Alert.alert("Erro", "Não foi possível carregar seus filmes.");
            setMovies([]);
        } finally {
            setRefreshing(false);
            setLoadingInitial(false);
        }
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
            router.push({ pathname: `/telas/DetalhesFilmeTMDB`, params: { movieId: movie.id } });
        } else if (movie.isExternal) {
            router.push({ pathname: `/telas/DetalhesFilmeExterno`, params: { movieId: movie.id } });
        }
    };

    const navigateToTags = (movieId: string) => {
        router.push({ pathname: '/telas/Tags', params: { movieId: movieId } });
    };

    const handleRemoveMovie = async (movie: Movie) => {
        if (!movie.isExternal) {
            Alert.alert("Ação não permitida", "Você só pode excluir filmes que foram adicionados manually.");
            return;
        }
        Alert.alert("Excluir Filme", `Tem certeza que deseja excluir "${movie.title}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                onPress: async () => { 
                    try {
                        await movieService.deleteMovie(movie.id);
                        Alert.alert("Sucesso", "Filme excluído!");
                        fetchMovies(); 
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível excluir o filme.");
                    }
                },
                style: "destructive"
            }
        ]);
    };
    
    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
            </View>

            <ScrollView
                stickyHeaderIndices={[0]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
                contentContainerStyle={{paddingBottom: 150}}
            >
                <View style={meusFilmesStyles.filtersContainer}>
                    <View style={meusFilmesStyles.searchContainer}>
                        <AntDesign name="search1" size={20} color="#7f8c8d" style={meusFilmesStyles.searchIcon} />
                        <TextInput
                            placeholder="Buscar em Meus Filmes..."
                            placeholderTextColor="#7f8c8d"
                            style={meusFilmesStyles.searchInput}
                            onChangeText={setSearchTerm}
                            value={searchTerm}
                        />
                    </View>
                    <Text style={meusFilmesStyles.filterSectionTitle}>Fonte do Filme</Text>
                    <View style={meusFilmesStyles.filterButtonsContainer}>
                        <Pressable style={[meusFilmesStyles.filterButton, sourceFilter === 'all' && meusFilmesStyles.filterButtonSelected]} onPress={() => setSourceFilter('all')}><Text style={sourceFilter === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text></Pressable>
                        <Pressable style={[meusFilmesStyles.filterButton, sourceFilter === 'app_db' && meusFilmesStyles.filterButtonSelected]} onPress={() => setSourceFilter('app_db')}><Text style={sourceFilter === 'app_db' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>TMDB</Text></Pressable>
                        <Pressable style={[meusFilmesStyles.filterButton, sourceFilter === 'external' && meusFilmesStyles.filterButtonSelected]} onPress={() => setSourceFilter('external')}><Text style={sourceFilter === 'external' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Manuais</Text></Pressable>
                    </View>
                    <Text style={meusFilmesStyles.filterSectionTitle}>Filtrar por Avaliação</Text>
                    <View style={meusFilmesStyles.filterButtonsContainer}>
                        <Pressable style={[meusFilmesStyles.filterButton, statusFilter === 'all' && meusFilmesStyles.filterButtonSelected]} onPress={() => setStatusFilter('all')}><Text style={statusFilter === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text></Pressable>
                        <Pressable style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'like2' && meusFilmesStyles.filterButtonSelected]} onPress={() => setStatusFilter('like2')}><AntDesign name="like2" size={16} color={statusFilter === 'like2' ? 'black' : '#eaeaea'} /></Pressable>
                        <Pressable style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'dislike2' && meusFilmesStyles.filterButtonSelected]} onPress={() => setStatusFilter('dislike2')}><AntDesign name="dislike2" size={16} color={statusFilter === 'dislike2' ? 'black' : '#eaeaea'} /></Pressable>
                        <Pressable style={[meusFilmesStyles.filterButton, { paddingHorizontal: 20 }, statusFilter === 'staro' && meusFilmesStyles.filterButtonSelected]} onPress={() => setStatusFilter('staro')}><AntDesign name="staro" size={16} color={statusFilter === 'staro' ? 'black' : '#eaeaea'} /></Pressable>
                    </View>
                    
                    <Pressable style={meusFilmesStyles.playlistButton} onPress={() => router.push('/telas/ListaPlaylists')}>
                        <AntDesign name="menufold" size={20} color="black" style={{marginRight: 10}}/>
                        <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                    </Pressable>
                </View>

                <View style={meusFilmesStyles.moviesGrid}>
                    {loadingInitial && !refreshing ? ( 
                        <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 50, width: '100%' }} />
                    ) : movies.length > 0 ? (
                        movies.map(movie => (
                            <View key={movie.id} style={meusFilmesStyles.movieItem}>
                                <Pressable onPress={() => navigateToMovieDetails(movie)}>
                                    <View style={meusFilmesStyles.posterContainer}>
                                        {movie.posterUrl ? (
                                            <Image source={{ uri: movie.posterUrl }} style={meusFilmesStyles.moviePoster} />
                                        ) : (
                                            <View style={meusFilmesStyles.genericPosterPlaceholder}>
                                                <Text style={meusFilmesStyles.genericPosterText} numberOfLines={3}>
                                                    {movie.title}
                                                </Text>
                                            </View>
                                        )}
                                        {movie.status && (
                                            <AntDesign name={movie.status as any} size={18} color="#FFD700" style={meusFilmesStyles.statusIconWrapper} />
                                        )}
                                    </View>
                                    <Text style={meusFilmesStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                                </Pressable>
                                <View style={meusFilmesStyles.interactionIconsContainer}>
                                    <Pressable onPress={() => navigateToTags(movie.id)} style={meusFilmesStyles.iconWrapper}>
                                        <AntDesign name="tags" size={20} color="black"/>
                                    </Pressable>
                                    {movie.isExternal && ( 
                                        <Pressable onPress={() => handleRemoveMovie(movie)} style={meusFilmesStyles.iconWrapper}>
                                            <AntDesign name="delete" size={20} color="#FF6347"/>
                                        </Pressable>
                                    )}
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
            
            {/* BOTÃO CORRIGIDO COM TEXTO E ÍCONE */}
            <Pressable style={meusFilmesStyles.addExternalMovieButton} onPress={handleAddMovie}>
                <AntDesign name="plus" size={18} color="black" style={{marginRight: 8}}/>
                <Text style={meusFilmesStyles.addExternalMovieButtonText}>Adicionar Filme</Text>
            </Pressable>
        </View>
    );
}

const meusFilmesStyles = StyleSheet.create({
    header: { paddingTop: 50, paddingBottom: 20, backgroundColor: "#1A2B3E" },
    headerTitle: { color: "#eaeaea", fontSize: 24, fontWeight: "bold", textAlign: 'center' },
    filtersContainer: {
        backgroundColor: '#111925', 
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E3D50', borderRadius: 25, paddingHorizontal: 15, marginVertical: 10, borderWidth: 1, borderColor: '#4A6B8A' },
    searchIcon: { marginRight: 10, color: '#7f8c8d' },
    searchInput: { flex: 1, color: '#eaeaea', fontSize: 16, height: 45 },
    filterSectionTitle: { color: '#b0b0b0', fontSize: 14, marginLeft: 5, marginTop: 10, marginBottom: 10 },
    filterButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, gap: 10 },
    filterButton: { backgroundColor: '#2E3D50', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#4A6B8A', alignItems: 'center', justifyContent: 'center' },
    filterButtonSelected: { backgroundColor: '#3E9C9C', borderColor: '#3E9C9C' },
    filterButtonText: { color: '#eaeaea', fontWeight: 'bold', fontSize: 12 },
    filterButtonTextSelected: { color: 'black', fontWeight: 'bold', fontSize: 12 },
    playlistButton: {
        backgroundColor: "#3E9C9C", 
        padding: 12, 
        borderRadius: 26, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    addExternalMovieButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#3E9C9C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 26,
        flexDirection: 'row', // Para alinhar ícone e texto
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        zIndex: 10,
    },
    addExternalMovieButtonText: { // Estilo para o texto do botão
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    moviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    movieItem: { width: '48%', marginBottom: 20, backgroundColor: '#2E3D50', borderRadius: 12, paddingBottom: 10, overflow: 'hidden' },
    posterContainer: { width: '100%', height: 240, position: 'relative', backgroundColor: '#4A6B8A' },
    moviePoster: { width: '100%', height: '100%', resizeMode: 'cover' },
    genericPosterPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 10 },
    genericPosterText: { color: '#eaeaea', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    movieTitle: { color: "#eaeaea", fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8, paddingHorizontal: 5, height: 35 },
    statusIconWrapper: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', padding: 5, borderRadius: 15, zIndex: 1 },
    interactionIconsContainer: { flexDirection: "row", justifyContent: 'space-evenly', alignItems: 'center', width: '100%', marginTop: 10 },
    iconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#4A6B8A", justifyContent: 'center', alignItems: 'center' },
    noMoviesContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 50, paddingHorizontal: 20 },
    noMoviesText: { color: '#eaeaea', fontSize: 16, textAlign: 'center' },
});

export default MeusFilmes;