// aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Importações do react-native-chart-kit
import {
    PieChart, 
    BarChart, 
} from 'react-native-chart-kit';

import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
import { Review } from '../../src/models/Review';
import { ReviewService } from '../../src/services/ReviewService';
import { styles } from '../../app/styles';

// Largura da tela para responsividade dos gráficos
const screenWidth = Dimensions.get("window").width;

// Define uma constante para o número de gêneros principais a serem exibidos no PieChart
const TOP_N_GENRES_PIE = 4; // Alterado para 4 gêneros principais
// Define uma constante para o número de gêneros principais a serem exibidos no texto
const TOP_N_GENRES_TEXT = 3;

export default function Home() {
    const router = useRouter();
    const movieService = MovieService.getInstance();
    const reviewService = ReviewService.getInstance();
    const auth = getAuth();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Estados para os dados dos gráficos (formatos adaptados para react-native-chart-kit)
    const [genrePieChartData, setGenrePieChartData] = useState<any[]>([]); 
    // Estado para os dados do BarChart
    const [genreBarChartData, setGenreBarChartData] = useState<{ labels: string[], datasets: { data: number[] }[] }>({ labels: [], datasets: [{ data: [] }] });
    const [topGenresText, setTopGenresText] = useState<string>(''); 
    const [averageFavoriteDuration, setAverageFavoriteDuration] = useState<string>(''); 
    const [idealMovieDuration, setIdealMovieDuration] = useState<string>(''); 


    // Configuração base para os gráficos
    const chartConfig = {
        backgroundGradientFrom: '#1A2B3E', 
        backgroundGradientTo: '#1A2B3E', 
        color: (opacity = 1) => `rgba(234, 234, 234, ${opacity})`, 
        labelColor: (opacity = 1) => `rgba(234, 234, 234, ${opacity})`, 
        strokeWidth: 2, 
        barPercentage: 0.7, 
        useShadowColorFromDataset: false, 
        decimalPlaces: 0, 
    };

    // Monitora o estado de autenticação do usuário
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                // Opcional: redirecionar para login se não houver usuário autenticado
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const loadPopularMovies = useCallback(async () => {
        setLoading(true);
        try {
            const movies = await movieService.getPopularMovies();
            setPopularMovies(movies);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar as recomendações.');
        } finally {
            setLoading(false);
        }
    }, [movieService]);

    const loadChartData = useCallback(async () => {
        if (!currentUser) return;

        try {
            const allUserMovies = await movieService.getFilteredAndRatedMovies('all', 'all');
            const allUserReviews = await reviewService.getAllUserReviews();

            const moviesById = new Map<string, Movie>();
            allUserMovies.forEach(movie => moviesById.set(movie.id, movie));

            // --- Processamento para o Gráfico de Gêneros Avaliados (dados brutos) ---
            const genreDistributionCounts: { [key: string]: number } = {};
            allUserReviews.forEach(review => {
                const movie = moviesById.get(review.movieId);
                if (movie && movie.genre) {
                    const primaryGenre = movie.genre.split(',')[0].trim();
                    if (primaryGenre) {
                        genreDistributionCounts[primaryGenre] = (genreDistributionCounts[primaryGenre] || 0) + 1;
                    }
                }
            });

            // Cores para o gráfico (agora serão usadas principalmente para a legenda manual)
            const genreChartColors = [
                "#3E9C9C", 
                "#FFD700", 
                "#FF6347", 
                "#4682B4", 
                "#9370DB", 
                "#FFA07A", 
                "#20B2AA", 
                "#8A2BE2", 
                "#FF4500", 
                "#00CED1", 
                "#808080", 
            ];
            
            const sortedGenres = Object.entries(genreDistributionCounts)
                .sort(([, countA], [, countB]) => countB - countA); 

            const topGenresForChart = sortedGenres.slice(0, TOP_N_GENRES_PIE); 
            const otherGenresCount = sortedGenres.slice(TOP_N_GENRES_PIE).reduce((sum, [, count]) => sum + count, 0); 

            let colorIndex = 0;
            const genreDataFormatted = topGenresForChart.map(([genre, count]) => {
                const color = genreChartColors[colorIndex % (genreChartColors.length -1)]; 
                colorIndex++;
                return {
                    name: genre,
                    population: count,
                    color: color,
                    legendFontColor: "#eaeaea",
                    legendFontSize: 12
                };
            });

            if (otherGenresCount > 0) {
                genreDataFormatted.push({
                    name: "Outros",
                    population: otherGenresCount,
                    color: genreChartColors[genreChartColors.length -1], 
                    legendFontColor: "#eaeaea",
                    legendFontSize: 12
                });
            }
            
            setGenrePieChartData(genreDataFormatted); 

            // NOVO: Preparar dados para o BarChart
            const barChartLabels = genreDataFormatted.map(d => d.name);
            const barChartValues = genreDataFormatted.map(d => d.population);
            setGenreBarChartData({
                labels: barChartLabels,
                datasets: [{
                    data: barChartValues,
                }]
            });


            // --- Processamento para o Texto dos Top 3 Gêneros e Duração Ideal ---
            const genreRawCounts: { [key: string]: { likes: number, dislikes: number, favorites: number, total: number } } = {};
            let totalFavoriteDuration = 0; 
            let favoriteMovieCount = 0; 
            let totalLikedDuration = 0; 
            let likedMovieCount = 0; 


            allUserReviews.forEach(review => {
                const movie = moviesById.get(review.movieId);
                if (movie && movie.genre) {
                    const primaryGenre = movie.genre.split(',')[0].trim();
                    if (primaryGenre) {
                        if (!genreRawCounts[primaryGenre]) {
                            genreRawCounts[primaryGenre] = { likes: 0, dislikes: 0, favorites: 0, total: 0 };
                        }
                        if (review.reviewType === 'like') genreRawCounts[primaryGenre].likes++;
                        else if (review.reviewType === 'dislike') genreRawCounts[primaryGenre].dislikes++;
                        else if (review.reviewType === 'favorite') genreRawCounts[primaryGenre].favorites++;
                        genreRawCounts[primaryGenre].total++; 
                    }
                }
                // Coleta dados para a duração média favorita
                if (review.reviewType === 'favorite' && movie && typeof movie.duration === 'number' && movie.duration > 0) {
                    totalFavoriteDuration += movie.duration;
                    favoriteMovieCount++;
                }
                // NOVO: Coleta dados para a duração média de filmes gostei
                if (review.reviewType === 'like' && movie && typeof movie.duration === 'number' && movie.duration > 0) {
                    totalLikedDuration += movie.duration;
                    likedMovieCount++;
                }
            });

            // Ordena os gêneros para o texto: Favorito > Gostei > Não Gostei
            const sortedGenresForText = Object.entries(genreRawCounts)
                .sort(([, countsA], [, countsB]) => {
                    // Critério principal: Favoritos
                    if (countsB.favorites !== countsA.favorites) {
                        return countsB.favorites - countsA.favorites;
                    }
                    // Critério de desempate: Gostei
                    if (countsB.likes !== countsA.likes) {
                        return countsB.likes - countsA.likes;
                    }
                    // Critério de desempate final: Não Gostei
                    return countsB.dislikes - countsB.dislikes;
                })
                .slice(0, TOP_N_GENRES_TEXT); 

            if (sortedGenresForText.length > 0) {
                // Formata o texto com enumeração
                const formattedText = ["Top 3 Gêneros"];
                sortedGenresForText.forEach(([,], index) => {
                    formattedText.push(`${index + 1}. ${sortedGenresForText[index][0]}`);
                });
                setTopGenresText(formattedText.join('\n')); 
            } else {
                setTopGenresText('Avalie filmes para ver seus gêneros principais aqui!');
            }

            // Calcula e define a duração média favorita
            if (favoriteMovieCount > 0) {
                const average = Math.round(totalFavoriteDuration / favoriteMovieCount);
                setAverageFavoriteDuration(`Duração Favorita: ${average} min`);
            } else {
                setAverageFavoriteDuration('Duração Favorita: N/A');
            }

            // NOVO: Calcula e define a duração ideal (média ponderada)
            const totalWeightedDuration = (totalFavoriteDuration * 3) + (totalLikedDuration * 2);
            const totalWeight = (favoriteMovieCount * 3) + (likedMovieCount * 2);

            if (totalWeight > 0) {
                const idealAverage = Math.round(totalWeightedDuration / totalWeight);
                setIdealMovieDuration(`Duração Ideal: ${idealAverage} min`);
            } else {
                setIdealMovieDuration('Duração Ideal: N/A');
            }


        } catch (error) {
            console.error("Erro ao carregar dados para os gráficos:", error);
        }
    }, [currentUser, movieService, reviewService]);

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const apiResults = await movieService.searchMovies(query);
            setSearchResults(apiResults);
        } catch (error) {
            console.error('Erro na busca:', error);
            Alert.alert('Erro', 'Não foi possível realizar a busca.');
        } finally {
            setIsSearching(false);
        }
    }, [movieService]);

    useEffect(() => {
        loadPopularMovies();
    }, [loadPopularMovies]);

    useFocusEffect(
        useCallback(() => {
            if (currentUser) {
                loadChartData();
            }
        }, [currentUser, loadChartData])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, handleSearch]);

    const navigateToMovieDetails = (movieId: string) => {
        router.push({
            pathname: '/telas/DetalhesFilmeTMDB',
            params: { movieId },
        });
    };

    const renderMovieItem = ({ item }: { item: Movie }) => (
        <Pressable style={homeStyles.card} onPress={() => navigateToMovieDetails(item.id)}>
            <View style={homeStyles.posterContainer}>
                {item.posterUrl ? (
                    <Image source={{ uri: item.posterUrl }} style={homeStyles.poster} />
                ) : (
                    <View style={homeStyles.posterPlaceholder}>
                        <AntDesign name="videocamera" size={40} color="#eaeaea" />
                    </View>
                )}
                {item.status && (
                    <View style={homeStyles.movieStatusOverlay}>
                        <AntDesign name={item.status} size={20} color="#FFD700" />
                    </View>
                )}
            </View>
            <Text style={homeStyles.movieTitle} numberOfLines={2}>{item.title}</Text>
        </Pressable>
    );

    const renderSearchResultItem = ({ item }: { item: Movie }) => (
        <Pressable style={homeStyles.searchItem} onPress={() => navigateToMovieDetails(item.id)}>
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={homeStyles.searchPoster} />
            ) : (
                <View style={homeStyles.searchPosterPlaceholder}>
                    <FontAwesome name="image" size={24} color="#eaeaea" />
                </View>
            )}
            <View style={homeStyles.searchInfo}>
                <Text style={homeStyles.searchTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={homeStyles.searchYear}>{item.releaseYear || 'Sem data'}</Text>
            </View>
            {item.status && (
                <AntDesign name={item.status} size={18} color="#FFD700" style={homeStyles.searchStatusIcon} />
            )}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={homeStyles.header}>
                <Image source={require('../../assets/images/filmeia-logo2.png')} style={homeStyles.logo} />
            </View>

            <View style={homeStyles.searchSection}>
                <View style={styles.textInput}>
                    <AntDesign name="search1" size={20} color="black" />
                    <TextInput
                        style={styles.input}
                        placeholder="Pesquisar por filmes"
                        placeholderTextColor="grey"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3E9C9C" style={{ flex: 1 }} />
            ) : searchTerm.trim() ? (
                isSearching ? (
                    <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearchResultItem}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Text style={homeStyles.emptyText}>Nenhum filme encontrado.</Text>}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    />
                )
            ) : (
                <ScrollView>
                    <View style={homeStyles.section}>
                        <Text style={homeStyles.sectionTitle}>Recomendações</Text>
                        <View style={{ height: 280 }}>
                            <FlatList
                                data={popularMovies}
                                renderItem={renderMovieItem}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 5, paddingRight: 20 }}
                                ListEmptyComponent={
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 300 }}>
                                        <Text style={homeStyles.emptyText}>Não foi possível carregar as recomendações.</Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>

                    <View style={homeStyles.section}>
                        <Text style={homeStyles.sectionTitle}>Seu Perfil Cinematográfico</Text>
                        <View style={homeStyles.cinematicProfileContainer}>
                            {/* Texto dos Top 3 Gêneros (AGORA ACIMA DO GRÁFICO) */}
                        {topGenresText ? (
                            <View style={{ alignItems: 'center', marginTop: 20 }}>
                                <Text style={[homeStyles.topGenresText, { fontWeight: 'bold' }]}>Top 3 Gêneros</Text>
                                {topGenresText.split('\n').slice(1).map((line, index) => (
                                    <Text key={index} style={homeStyles.topGenresText}>{line}</Text>
                                ))}
                            </View>
                        ) : (
                            <Text style={homeStyles.emptyChartText}>Avalie filmes para ver seus gêneros principais aqui!</Text>
                        )}


                            {/* Renderiza gráfico de barras de gêneros */}
                            {genreBarChartData.labels.length > 0 && (
                                <>
                                    <Text style={homeStyles.chartTitle}>Gêneros de Filmes Avaliados</Text>
                                    <BarChart 
                                        data={genreBarChartData}
                                        width={screenWidth - 40} 
                                        height={250} 
                                        yAxisLabel="" 
                                        yAxisSuffix="" 
                                        chartConfig={{
                                            ...chartConfig,
                                            decimalPlaces: 0, 
                                            barPercentage: 0.7, 
                                            propsForBackgroundLines: {
                                                strokeDasharray: '', 
                                                stroke: '#4A6B8A', 
                                            },
                                            propsForLabels: {
                                                fill: 'rgba(0, 0, 0, 0)', 
                                            },
                                            color: (opacity = 0) => `rgba(255, 215, 0, ${opacity})`, 
                                            barRadius: 5, 
                                        }}
                                        verticalLabelRotation={0} 
                                        fromZero={true} 
                                        showValuesOnTopOfBars={true} 
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16
                                        }}
                                    />
                                    {/* REMOVIDO: Legenda Manual para Gêneros com Cores */}
                                </>
                            )}
                            
                            {/* NOVO: Duração Ideal */}
                            {idealMovieDuration && (
                                <Text style={homeStyles.idealDurationText}>{idealMovieDuration}</Text>
                            )}
                        </View>
                        <Text style={homeStyles.disclaimerText}>
                            (Dados baseados em suas avaliações)
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const homeStyles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 40,
        resizeMode: 'contain',
    },
    searchSection: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    card: {
        marginLeft: 15,
        width: 150,
    },
    posterContainer: {
        width: '100%',
        height: 225,
        borderRadius: 10,
        backgroundColor: '#4A6B8A',
        position: 'relative',
        marginBottom: 8,
        overflow: 'hidden',
    },
    poster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    posterPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    movieTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        minHeight: 34,
    },
    movieStatusOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 5,
        borderRadius: 15,
        zIndex: 1,
    },
    searchItem: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#4A6B8A',
    },
    searchPoster: {
        width: 50,
        height: 75,
        borderRadius: 5,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchPosterPlaceholder: {
        width: 50,
        height: 75,
        borderRadius: 5,
        backgroundColor: '#4A6B8A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInfo: {
        marginLeft: 15,
        flex: 1,
    },
    searchTitle: {
        color: 'white',
        fontSize: 16,
    },
    searchYear: {
        color: '#b0b0b0',
        fontSize: 14,
        marginTop: 4,
    },
    searchStatusIcon: {
        marginLeft: 10,
    },
    emptyText: {
        color: '#b0b0b0',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    cinematicProfileContainer: {
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        minHeight: 250,
        justifyContent: 'center',
    },
    chartTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyChartText: {
        color: '#b0b0b0',
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
    disclaimerText: {
        color: '#b0b0b0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 20,
    },
    barChartLegendContainer: { // Este estilo será removido do JSX
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    legendItem: { // Este estilo será removido do JSX
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 5,
    },
    legendColorBox: { // Este estilo será removido do JSX
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
    },
    legendText: { // Este estilo será removido do JSX
        color: '#eaeaea',
        fontSize: 12,
    },
    topGenresText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
        paddingHorizontal: 18,
    },
    idealDurationText: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});