// aplicativo/app/telas/MeusFilmes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { styles } from '../styles';
import { Movie, MovieStatus } from '../../src/models/Movie'; // Importa o modelo Movie original e MovieStatus
import { MovieService } from '../../src/services/MovieService';
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../../src/models/Tag'; // Importe Tag e os enums
import { TagService } from '../../src/services/TagService'; // Importe TagService

// Estende o tipo Movie para incluir a propriedade 'tag'
interface MovieWithTag extends Movie {
    tag: Tag | null;
}

// Mapeamentos para os rótulos de exibição das tags (repetido de Tags.tsx para consistência)
const watchedStatusLabels: Record<WatchedStatus, string> = {
    'assistido': 'Assisti',
    'assistido_old': 'Assisti faz tempo',
    'drop': 'Saí no meio',
    'nao_assistido': 'Não Assisti',
};

const interestStatusLabels: Record<InterestStatus, string> = {
    'sim': 'Tenho interesse',
    'nao': 'Não tenho interesse',
};

const rewatchStatusLabels: Record<RewatchStatus, string> = {
    'sim': 'Voltaria',
    'nao': 'Não voltaria',
};

// Adiciona uma opção "Todos" para os filtros de tags
const allWatchedOptions = [{ value: null, label: 'Todos' }, ...Object.entries(watchedStatusLabels).map(([value, label]) => ({ value: value as WatchedStatus, label }))];
const allInterestOptions = [{ value: null, label: 'Todos' }, ...Object.entries(interestStatusLabels).map(([value, label]) => ({ value: value as InterestStatus, label }))];
const allRewatchOptions = [{ value: null, label: 'Todos' }, ...Object.entries(rewatchStatusLabels).map(([value, label]) => ({ value: value as RewatchStatus, label }))];

// Tipos para os filtros antigos
type MovieSourceFilter = 'all' | 'external' | 'app_db';
type ReviewStatusFilter = MovieStatus | 'all';


function MeusFilmesScreen() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allMovies, setAllMovies] = useState<MovieWithTag[]>([]); // Todos os filmes do usuário com tags
    const [filteredMovies, setFilteredMovies] = useState<MovieWithTag[]>([]); // Filmes após aplicar filtros
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Estado para controlar a visibilidade dos filtros

    // Estados para os filtros de tags
    const [watchedFilter, setWatchedFilter] = useState<WatchedStatus | null>(null);
    const [interestFilter, setInterestFilter] = useState<InterestStatus | null>(null);
    const [rewatchFilter, setRewatchFilter] = useState<RewatchStatus | null>(null);

    // Estados para os filtros antigos
    const [sourceFilter, setSourceFilter] = useState<MovieSourceFilter>('all');
    const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('all');


    const movieService = MovieService.getInstance();
    const tagService = TagService.getInstance(); // Instância do TagService
    const auth = getAuth();

    // Monitora o estado de autenticação do usuário
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

    // Função para carregar filmes e tags
    const loadMovies = useCallback(async () => {
        console.log("MeusFilmesScreen: loadMovies - currentUser:", currentUser?.uid);
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Usando getFilteredAndRatedMovies com filtros 'all' para obter todos os filmes do usuário
            const userMovies = await movieService.getFilteredAndRatedMovies('all', 'all');
            const userTags = await tagService.getAllUserTags(); // Busca todas as tags do usuário

            // Mapeia tags por movieId para acesso rápido
            const tagsByMovieId = new Map<string, Tag>();
            userTags.forEach(tag => {
                tagsByMovieId.set(tag.movieId, tag);
            });

            // Adiciona a tag correspondente a cada filme
            const moviesWithTags: MovieWithTag[] = userMovies.map(movie => ({
                ...movie,
                tag: tagsByMovieId.get(movie.id) || null // Adiciona a tag ao objeto do filme
            }));

            setAllMovies(moviesWithTags);
        } catch (error) {
            console.error("MeusFilmesScreen: Erro ao carregar filmes:", error);
            Alert.alert("Erro", "Não foi possível carregar seus filmes.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, movieService, tagService]);

    // Aplica os filtros (pesquisa e tags)
    useEffect(() => {
        let currentFiltered = allMovies;

        // Filtro por pesquisa
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(movie =>
                // Usando movie.title e movie.genre (singular)
                movie.title.toLowerCase().includes(lowerCaseQuery) ||
                (movie.genre && movie.genre.toLowerCase().includes(lowerCaseQuery))
            );
        }

        // Filtro por fonte do filme (antigo)
        if (sourceFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => {
                if (sourceFilter === 'external') return movie.isExternal;
                if (sourceFilter === 'app_db') return movie.isTmdb;
                return true; // Deveria ser 'all' se chegasse aqui, mas para segurança
            });
        }

        // Filtro por avaliação (antigo)
        if (statusFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => movie.status === statusFilter);
        }


        // Filtro por tags
        currentFiltered = currentFiltered.filter(movie => {
            const tag = movie.tag; // Acessa a tag diretamente do objeto movie
            
            // Se o filme não tem tag e algum filtro de tag está ativo (não nulo), ele não deve ser incluído
            if (!tag && (watchedFilter !== null || interestFilter !== null || rewatchFilter !== null)) {
                return false;
            }

            // Verifica o filtro de assistido
            if (watchedFilter !== null && tag?.watched !== watchedFilter) {
                return false;
            }
            // Verifica o filtro de interesse
            if (interestFilter !== null && tag?.interest !== interestFilter) {
                return false;
            }
            // Verifica o filtro de reassistir
            if (rewatchFilter !== null && tag?.rewatch !== rewatchFilter) {
                return false;
            }
            return true;
        });

        setFilteredMovies(currentFiltered);
    }, [allMovies, searchQuery, watchedFilter, interestFilter, rewatchFilter, sourceFilter, statusFilter]); // Adicionado sourceFilter e statusFilter

    // Carrega filmes quando o usuário autentica ou a tela é focada
    useFocusEffect(
        useCallback(() => {
            if (currentUser) {
                loadMovies();
            }
        }, [currentUser, loadMovies])
    );

    const handleMoviePress = (movie: MovieWithTag) => {
        // Navega para a tela de detalhes correta com base no tipo de filme
        if (movie.isTmdb) {
            router.push({ pathname: `/telas/DetalhesFilmeTMDB`, params: { movieId: movie.id } });
        } else if (movie.isExternal) {
            router.push({ pathname: `/telas/DetalhesFilmeExterno`, params: { movieId: movie.id } });
        } else {
            Alert.alert("Erro", "Tipo de filme desconhecido.");
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setWatchedFilter(null);
        setInterestFilter(null);
        setRewatchFilter(null);
        setSourceFilter('all'); // Resetar filtro de fonte
        setStatusFilter('all'); // Resetar filtro de avaliação
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

            {/* Botão MINHAS PLAYLISTS - Posicionado abaixo da barra de busca/filtros */}
            <Pressable style={meusFilmesStyles.playlistButton} onPress={() => router.push('/telas/ListaPlaylists')}>
                <AntDesign name="menufold" size={20} color="black" style={{marginRight: 10}}/>
                <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
            </Pressable>

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

                    {/* Filtros de Tags */}
                    <Text style={meusFilmesStyles.filterSectionTitle}>Status de Visualização (Tags):</Text>
                    <View style={meusFilmesStyles.filterOptionsRow}>
                        {allWatchedOptions.map(option => (
                            <Pressable
                                key={option.label}
                                style={[
                                    meusFilmesStyles.filterOptionButton,
                                    watchedFilter === option.value && meusFilmesStyles.filterOptionButtonSelected
                                ]}
                                onPress={() => setWatchedFilter(option.value)}
                            >
                                <Text style={meusFilmesStyles.filterOptionText}>{option.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={meusFilmesStyles.filterSectionTitle}>Interesse (Tags):</Text>
                    <View style={meusFilmesStyles.filterOptionsRow}>
                        {allInterestOptions.map(option => (
                            <Pressable
                                key={option.label}
                                style={[
                                    meusFilmesStyles.filterOptionButton,
                                    interestFilter === option.value && meusFilmesStyles.filterOptionButtonSelected
                                ]}
                                onPress={() => setInterestFilter(option.value)}
                            >
                                <Text style={meusFilmesStyles.filterOptionText}>{option.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={meusFilmesStyles.filterSectionTitle}>Reassistir (Tags):</Text>
                    <View style={meusFilmesStyles.filterOptionsRow}>
                        {allRewatchOptions.map(option => (
                            <Pressable
                                key={option.label}
                                style={[
                                    meusFilmesStyles.filterOptionButton,
                                    rewatchFilter === option.value && meusFilmesStyles.filterOptionButtonSelected
                                ]}
                                onPress={() => setRewatchFilter(option.value)}
                            >
                                <Text style={meusFilmesStyles.filterOptionText}>{option.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {(watchedFilter !== null || interestFilter !== null || rewatchFilter !== null || searchQuery !== '' || sourceFilter !== 'all' || statusFilter !== 'all') && (
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
                        <Image
                            source={{ uri: movie.posterUrl || 'https://placehold.co/90x135/2E3D50/eaeaea?text=Sem+Poster' }}
                            style={meusFilmesStyles.moviePoster}
                        />
                        <View style={meusFilmesStyles.movieInfo}>
                            <Text style={meusFilmesStyles.movieTitle}>{movie.title}</Text>
                            <Text style={meusFilmesStyles.movieYear}>{movie.releaseYear || 'Ano Desconhecido'}</Text>
                            {movie.tag && ( // Exibe as tags se existirem
                                <View style={meusFilmesStyles.movieTagsContainer}>
                                    {movie.tag.watched && (
                                        <Text style={meusFilmesStyles.movieTag}>
                                            {watchedStatusLabels[movie.tag.watched]}
                                        </Text>
                                    )}
                                    {movie.tag.interest && (
                                        <Text style={meusFilmesStyles.movieTag}>
                                            {interestStatusLabels[movie.tag.interest]}
                                        </Text>
                                    )}
                                    {movie.tag.rewatch && (
                                        <Text style={meusFilmesStyles.movieTag}>
                                            {rewatchStatusLabels[movie.tag.rewatch]}
                                        </Text>
                                    )}
                                </View>
                            )}
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
    playlistButton: { // Estilo para o botão Minhas Playlists
        backgroundColor: "#3E9C9C", 
        padding: 12, 
        borderRadius: 26, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 15, // Espaçamento após o botão
        marginHorizontal: 20,
    },
    filtersContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 15,
        maxHeight: 300, // Limita a altura para que a tela não fique muito longa
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
        paddingBottom: 100, // Garante espaço para o conteúdo rolante
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
    movieTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    movieTag: {
        backgroundColor: '#3E9C9C',
        color: '#fff',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 5,
        marginBottom: 5,
    },
    noMoviesText: {
        color: '#b0b0b0',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
    },
    addExternalMovieButton: { // Estilo para o botão flutuante de adicionar filme
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 30,
        elevation: 8,
        zIndex: 10,
    },
    addExternalMovieButtonText: { // NOVO ESTILO: Texto do botão flutuante
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
