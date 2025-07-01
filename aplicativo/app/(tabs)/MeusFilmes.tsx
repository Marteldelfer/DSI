// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/MeusFilmes.tsx
import React, { useState, useCallback, useEffect } from 'react'; // CORREÇÃO: useEffect foi adicionado aqui
import { ScrollView, View, Image, Pressable, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getFilteredAndRatedMovies, MovieStatus, Movie, MovieFilterType } from '../../utils/mockData';

function ComponenteFilmeAvaliado({ movie, statusIcon }: { movie: Movie, statusIcon: MovieStatus }) {
    const router = useRouter();

    if (!statusIcon) return null;

    const handlePress = () => {
        // Usa a tela de detalhes correta dependendo se o filme é do TMDB ou externo
        const pathname = movie.isTmdb ? '/telas/DetalhesFilme' : '/telas/DetalhesFilmeExterno';
        router.push({
            pathname: pathname,
            params: { movieId: movie.id },
        });
    };

    const handlePressTags = () => {
        // Usa a tela de detalhes correta dependendo se o filme é do TMDB ou externo
        const pathname = '/telas/Tags';
        router.push({
            pathname: pathname,
            params: { movieId: movie.id },
        });
    };

    const displayTitle = movie.title;
    const displayYear = movie.releaseYear ? ` (${movie.releaseYear})` : '';
    const placeholderText = `${displayTitle}${displayYear}`;

    return (
        <View style={meusFilmesStyles.movieContainer}>
        <Pressable onPress={handlePress}>
            {movie.posterUrl ? (
                <Image
                    source={{ uri: movie.posterUrl }}
                    style={meusFilmesStyles.moviePoster}
                />
            ) : (
                <View style={meusFilmesStyles.externalMoviePlaceholder}>
                    <Text style={meusFilmesStyles.externalMoviePlaceholderText} numberOfLines={3}>{placeholderText}</Text>
                </View>
            )}
            <Text style={meusFilmesStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>
            <View style={meusFilmesStyles.statusIconWrapper}>
                <AntDesign name={statusIcon as any} size={18} color="#eaeaea" />
            </View>
        </Pressable>
            <View style={meusFilmesStyles.interactionIconsContainer}>
                <Pressable onPress={handlePressTags}>
                    <View style={meusFilmesStyles.iconWrapper}><AntDesign name="tags" size={20} color="black"/></View>
                </Pressable>
            </View>
        </View>
    );
}

function MeusFilmes() {
    const router = useRouter();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [allMoviesBasedOnFilter, setAllMoviesBasedOnFilter] = useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState<MovieFilterType>('all');

    useFocusEffect(
        useCallback(() => {
            const movies = getFilteredAndRatedMovies(currentFilter);
            setAllMoviesBasedOnFilter(movies);
            applySearchFilter(movies, searchTerm);
        }, [currentFilter])
    );

    // Re-aplica a busca quando o termo de pesquisa ou a lista base mudam
    useEffect(() => {
        applySearchFilter(allMoviesBasedOnFilter, searchTerm);
    }, [searchTerm, allMoviesBasedOnFilter]);

    const applySearchFilter = (moviesToFilter: Movie[], term: string) => {
        if (term === '') {
            setFilteredMovies(moviesToFilter);
        } else {
            const lowerCaseSearchTerm = term.toLowerCase();
            const filtered = moviesToFilter.filter(movie =>
                movie.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                (movie.director && movie.director.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (movie.genre && movie.genre.toLowerCase().includes(lowerCaseSearchTerm))
            );
            setFilteredMovies(filtered);
        }
    };

    const handleAddMovie = () => {
        setShowAddMenu(false);
        router.push('/telas/AdicionarFilmeExterno');
    };

    return (
        <View style={styles.container}>
            <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 36, flex: 1}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Image source={require("../../assets/images/filmeia-logo2.png")} style={meusFilmesStyles.logo} />

                    <View style={meusFilmesStyles.searchContainer}>
                        <AntDesign name="search1" size={20} color="#888" style={meusFilmesStyles.searchIcon} />
                        <TextInput
                            placeholder="Buscar filmes avaliados..."
                            placeholderTextColor="#888"
                            style={meusFilmesStyles.searchInput}
                            onChangeText={setSearchTerm}
                            value={searchTerm}
                        />
                    </View>

                    <View style={meusFilmesStyles.filterButtonsContainer}>
                        <Pressable
                            style={[ meusFilmesStyles.filterButton, currentFilter === 'all' && meusFilmesStyles.filterButtonSelected ]}
                            onPress={() => setCurrentFilter('all')}
                        >
                            <Text style={currentFilter === 'all' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Todos</Text>
                        </Pressable>
                        <Pressable
                            style={[ meusFilmesStyles.filterButton, currentFilter === 'app_db' && meusFilmesStyles.filterButtonSelected ]}
                            onPress={() => setCurrentFilter('app_db')}
                        >
                            <Text style={currentFilter === 'app_db' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Filmes TMDB</Text>
                        </Pressable>
                        <Pressable
                            style={[ meusFilmesStyles.filterButton, currentFilter === 'external' && meusFilmesStyles.filterButtonSelected ]}
                            onPress={() => setCurrentFilter('external')}
                        >
                            <Text style={currentFilter === 'external' ? meusFilmesStyles.filterButtonTextSelected : meusFilmesStyles.filterButtonText}>Externos</Text>
                        </Pressable>
                    </View>


                    <Pressable style={{ width: '100%', marginBottom: 12}} onPress={() => router.push('/telas/ListaPlaylists')}>
                        <View style={{ backgroundColor: "#3E9C9C", padding: 12, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <AntDesign name="videocamera" size={24} color="black" style={{marginRight: 10}}/>
                            <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
                        </View>
                    </Pressable>

                    <View style={meusFilmesStyles.sectionContainer}>
                        <Text style={meusFilmesStyles.sectionTitle}>Filmes que você avaliou</Text>
                        <View style={meusFilmesStyles.moviesGrid}>
                            {filteredMovies.length > 0 ? (
                                filteredMovies.map(movie => (
                                    <ComponenteFilmeAvaliado
                                        key={movie.id}
                                        movie={movie}
                                        statusIcon={movie.status || null}
                                    >
                                    </ComponenteFilmeAvaliado>
                                ))
                            ) : (
                                <Text style={meusFilmesStyles.noMoviesText}>Nenhum filme encontrado.</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {showAddMenu && (
                <View style={meusFilmesStyles.addMenu}>
                    <Pressable style={meusFilmesStyles.addMenuItem} onPress={handleAddMovie}>
                        <Text style={meusFilmesStyles.addMenuText}>Adicionar Filme</Text>
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
    logo: { width: 300, height: 150, resizeMode: "contain", alignSelf: 'center' },
    sectionContainer: { marginTop: 24 },
    sectionTitle: { color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8 },
    moviesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    movieContainer: { padding: 4, alignItems: 'center', width: '32%', marginBottom: 15 },
    moviePoster: { width: '100%', height: 140, borderRadius: 12, backgroundColor: '#4A6B8A' },
    externalMoviePlaceholder: {
        width: '100%', height: 140, borderRadius: 12, backgroundColor: '#4A6B8A',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
    },
    externalMoviePlaceholderText: { color: '#eaeaea', fontSize: 14, fontWeight: 'bold', textAlign: 'center', },
    movieTitle: { color: "#eaeaea", fontSize: 11, textAlign: 'center', marginTop: 4, height: 30 },
    statusIconWrapper: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 15 },
    plusButton: { position: 'absolute', bottom: 90, right: 20, backgroundColor: '#3E9C9C', borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10, },
    addMenu: { position: 'absolute', bottom: 160, right: 20, backgroundColor: '#1A2B3E', borderRadius: 10, elevation: 3, zIndex: 11, padding: 10, },
    addMenuItem: { paddingVertical: 8, paddingHorizontal: 15, },
    addMenuText: { color: '#eaeaea', fontSize: 16, },
    noMoviesText: { color: '#eaeaea', fontSize: 16, textAlign: 'center', marginTop: 20, width: '100%', },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2B3E', borderRadius: 25, paddingHorizontal: 15, marginBottom: 10, height: 50, borderWidth: 1, borderColor: '#4A6B8A', },
    searchIcon: { marginRight: 10, },
    searchInput: { flex: 1, color: '#eaeaea', fontSize: 16, },
    filterButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, width: '100%', },
    filterButton: { backgroundColor: '#1A2B3E', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#4A6B8A', },
    filterButtonSelected: { backgroundColor: '#3E9C9C', borderColor: '#3E9C9C', },
    filterButtonText: { color: '#eaeaea', fontWeight: 'bold', },
    filterButtonTextSelected: { color: 'black', fontWeight: 'bold', },

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
    }
});

export default MeusFilmes;