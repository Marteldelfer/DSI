// O CONTEÚDO DESTE ARQUIVO ESTÁ FINALIZADO E CORRETO.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, TextInput, FlatList, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { styles } from '../styles';
import { Movie, MovieStatus } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService';
import { TagService } from '../../src/services/TagService';
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../../src/models/Tag';

type MovieSourceFilter = 'all' | 'external' | 'app_db';
type ReviewStatusFilter = MovieStatus | 'all';
type TagFilter = WatchedStatus | InterestStatus | RewatchStatus | 'all';

const mapStatusToIconName = (status: MovieStatus): 'like2' | 'dislike2' | 'staro' => {
  switch (status) {
    case 'like2': return 'like2';
    case 'dislike2': return 'dislike2';
    case 'staro': return 'staro';
    default: return 'staro';
  }
};


function MeusFilmesScreen() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allMovies, setAllMovies] = useState<Movie[]>([]); 
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]); 
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false); 

    const [sourceFilter, setSourceFilter] = useState<MovieSourceFilter>('all');
    const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('all');
    const [tagFilter, setTagFilter] = useState<TagFilter>('all');

    const movieService = MovieService.getInstance();
    const tagService = TagService.getInstance();
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

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [userMovies, userTags] = await Promise.all([
                movieService.getFilteredAndRatedMovies('all', 'all'),
                tagService.getAllUserTags()
            ]);
            setAllMovies(userMovies); 
            setAllTags(userTags);
        } catch (error) {
            console.error("MeusFilmesScreen: Erro ao carregar dados:", error);
            Alert.alert("Erro", "Não foi possível carregar seus dados.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, movieService, tagService]); 

    useEffect(() => {
        let currentFiltered = allMovies;
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(movie =>
                movie.title.toLowerCase().includes(lowerCaseQuery)
            );
        }
        if (sourceFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => {
                if (sourceFilter === 'external') return movie.isExternal;
                if (sourceFilter === 'app_db') return !movie.isExternal;
                return true; 
            });
        }
        if (statusFilter !== 'all') {
            currentFiltered = currentFiltered.filter(movie => movie.status === statusFilter);
        }
        if (tagFilter !== 'all') {
            const movieIdsWithTag = new Set(
                allTags.filter(tag => tag.watched === tagFilter || tag.interest === tagFilter || tag.rewatch === tagFilter).map(tag => tag.movieId)
            );
            currentFiltered = currentFiltered.filter(movie => movieIdsWithTag.has(movie.id));
        }
        setFilteredMovies(currentFiltered);
    }, [allMovies, allTags, searchQuery, sourceFilter, statusFilter, tagFilter]); 

    useFocusEffect(
        useCallback(() => {
            if (currentUser) {
                loadData();
            }
        }, [currentUser, loadData])
    );

    const handleMoviePress = (movie: Movie) => { 
        const pathname = movie.isTmdb ? `/telas/DetalhesFilmeTMDB` : `/telas/DetalhesFilmeExterno`;
        router.push({ pathname, params: { movieId: movie.id } });
    };

    const navigateToTags = (movieId: string) => {
        router.push({ pathname: '/telas/Tags', params: { movieId: movieId } });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSourceFilter('all'); 
        setStatusFilter('all'); 
        setTagFilter('all');
    };

    const renderCardItem = ({ item }: { item: Movie }) => (
        <Pressable style={meusFilmesStyles.movieCard} onPress={() => handleMoviePress(item)}>
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={meusFilmesStyles.moviePoster} />
            ) : (
                <View style={meusFilmesStyles.genericPosterPlaceholder}>
                    <Text style={meusFilmesStyles.genericPosterText} numberOfLines={3}>{item.title}{item.releaseYear && ` (${item.releaseYear})`}</Text>
                </View>
            )}
            <View style={meusFilmesStyles.movieInfo}>
                <Text style={meusFilmesStyles.movieTitle} numberOfLines={3}>{item.title}</Text>
                <Text style={meusFilmesStyles.movieYear}>{item.releaseYear || 'Ano Desconhecido'}</Text>
                <Pressable style={meusFilmesStyles.tagButtonPerMovie} onPress={(e) => { e.stopPropagation(); navigateToTags(item.id); }}>
                    <AntDesign name="tags" size={18} color="#eaeaea" />
                    <Text style={meusFilmesStyles.tagButtonPerMovieText}>Tags</Text>
                </Pressable>
            </View>
            {item.status && (
                <View style={meusFilmesStyles.movieStatusBadge}>
                     <AntDesign name={mapStatusToIconName(item.status)} size={18} color="#FFD700" />
                </View>
            )}
        </Pressable>
    );

    if (loading || !currentUser) {
        return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#3E9C9C" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={meusFilmesStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={meusFilmesStyles.headerTitle}>Meus Filmes</Text>
            </View>

            <View style={meusFilmesStyles.searchAreaContainer}>
                <View style={meusFilmesStyles.searchBar}>
                    <Ionicons name="search" size={20} color="#888" style={meusFilmesStyles.searchIcon} />
                    <TextInput style={meusFilmesStyles.searchInput} placeholder="Buscar por título..." placeholderTextColor="#888" value={searchQuery} onChangeText={setSearchQuery}/>
                </View>
                <Pressable onPress={() => setFilterModalVisible(true)} style={meusFilmesStyles.filterButton}>
                    <Ionicons name="filter" size={24} color="black" />
                </Pressable>
            </View>

            <FlatList
                data={filteredMovies}
                renderItem={renderCardItem}
                keyExtractor={item => item.id}
                contentContainerStyle={meusFilmesStyles.scrollViewContent}
                ListEmptyComponent={<Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado.</Text>}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isFilterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={meusFilmesStyles.modalContainer}>
                    <View style={meusFilmesStyles.modalContent}>
                        <View style={meusFilmesStyles.modalHeader}>
                            <Text style={meusFilmesStyles.modalTitle}>Filtros e Ações</Text>
                            <Pressable onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#FF6347" />
                            </Pressable>
                        </View>
                        
                        <ScrollView>
                             <Pressable style={[meusFilmesStyles.actionButton, { marginBottom: 20 }]} onPress={() => { setFilterModalVisible(false); router.push('/telas/ListaPlaylists'); }}>
                                <AntDesign name="menufold" size={20} color="black" style={{marginRight: 10}}/>
                                <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                            </Pressable>

                            <Text style={meusFilmesStyles.filterSectionTitle}>Fonte do Filme:</Text>
                            <View style={meusFilmesStyles.filterOptionsRow}>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'all' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setSourceFilter('all')}><Text style={meusFilmesStyles.filterOptionText}>Todos</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'app_db' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setSourceFilter('app_db')}><Text style={meusFilmesStyles.filterOptionText}>TMDB</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, sourceFilter === 'external' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setSourceFilter('external')}><Text style={meusFilmesStyles.filterOptionText}>Manuais</Text></Pressable>
                            </View>

                            <Text style={meusFilmesStyles.filterSectionTitle}>Avaliação:</Text>
                            <View style={meusFilmesStyles.filterOptionsRow}>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, statusFilter === 'all' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setStatusFilter('all')}><Text style={meusFilmesStyles.filterOptionText}>Todos</Text></Pressable>
                                {/* AQUI ESTÁ A ALTERAÇÃO FINAL */}
                                <Pressable style={[meusFilmesStyles.filterOptionButton, statusFilter === 'like2' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setStatusFilter('like2')}><AntDesign name="like2" size={16} color={'black'} /></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, statusFilter === 'dislike2' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setStatusFilter('dislike2')}><AntDesign name="dislike2" size={16} color={'black'} /></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, statusFilter === 'staro' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setStatusFilter('staro')}><AntDesign name="staro" size={16} color={'black'} /></Pressable>
                            </View>
                            
                            <Text style={meusFilmesStyles.filterSectionTitle}>Tags:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, tagFilter === 'all' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setTagFilter('all')}><Text style={meusFilmesStyles.filterOptionText}>Todas</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, tagFilter === 'assistido' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setTagFilter('assistido')}><Text style={meusFilmesStyles.filterOptionText}>Já Vi</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, tagFilter === 'nao_assistido' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setTagFilter('nao_assistido')}><Text style={meusFilmesStyles.filterOptionText}>Não Vi</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, tagFilter === 'sim' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setTagFilter('sim')}><Text style={meusFilmesStyles.filterOptionText}>Interesse</Text></Pressable>
                                <Pressable style={[meusFilmesStyles.filterOptionButton, tagFilter === 'nao' && meusFilmesStyles.filterOptionButtonSelected]} onPress={() => setTagFilter('nao')}><Text style={meusFilmesStyles.filterOptionText}>Sem Interesse</Text></Pressable>
                            </ScrollView>
                        </ScrollView>

                        {(searchQuery !== '' || sourceFilter !== 'all' || statusFilter !== 'all' || tagFilter !== 'all') && ( 
                            <Pressable style={meusFilmesStyles.clearFiltersButton} onPress={clearFilters}>
                                <Text style={styles.textoBotao}>Limpar Filtros</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>

            <Pressable style={meusFilmesStyles.addExternalMovieButton} onPress={() => router.push('/telas/AdicionarFilmeExterno')}>
                <Text style={meusFilmesStyles.addExternalMovieButtonText}>Filme Externo</Text>
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
        paddingBottom: 10,
    },
    headerTitle: {
        color: "#eaeaea",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 20,
    },
    searchAreaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
    },
    searchIcon: {
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        color: '#eaeaea',
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: '#3E9C9C',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
    },
    actionButtonsContainer: {}, 
    actionButton: { 
        backgroundColor: "#3E9C9C", 
        paddingVertical: 12, 
        paddingHorizontal: 15, 
        borderRadius: 26, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginHorizontal: 5, 
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
        alignItems: 'flex-start',
        padding: 10,
    },
    moviePoster: {
        width: 90,
        height: 135,
        borderRadius: 8,
        resizeMode: 'cover', 
    },
    genericPosterPlaceholder: { 
        width: 90,
        height: 135,
        borderRadius: 8,
        backgroundColor: '#0D1F2D',
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
        paddingLeft: 12,
        paddingRight: 35,
        height: 135,
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    movieTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    movieYear: {
        color: '#b0b0b0',
        fontSize: 14,
    },
    movieStatusBadge: { 
        position: 'absolute', 
        top: 15, 
        right: 15, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
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
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        backgroundColor: '#0D1F2D',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2E3D50',
        paddingBottom: 15,
        marginBottom: 10,
    },
    modalTitle: {
        color: '#eaeaea',
        fontSize: 20,
        fontWeight: 'bold',
    },
    filtersContainer: {},
    filterSectionTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
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
        backgroundColor: '#3E9C9C',
    },
    filterOptionText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 13,
    },
    clearFiltersButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 20,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
    },
});