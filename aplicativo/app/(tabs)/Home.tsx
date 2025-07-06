// aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Pressable,
    ActivityIndicator,
    TextInput, // Import adicionado
    RefreshControl
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
import { getPopularMovies } from '../../src/api/tmdb';
// ADICIONADO: Import da imagem da logo
import FilmeiaLogo from '../../assets/images/filmeia-logo2.png';

export default function HomeScreen() {
    const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const movieService = MovieService.getInstance();

    const fetchMovies = async () => {
        setLoading(true);
        const moviesFromApi = await getPopularMovies();
        moviesFromApi.forEach(movie => movieService.addMovieToLocalStore(movie));
        setTrendingMovies(moviesFromApi);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchMovies();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMovies().then(() => setRefreshing(false));
    }, []);

    const navigateToMovieDetails = (movie: Movie) => {
        movieService.addMovieToLocalStore(movie);
        router.push({
            pathname: `/telas/DetalhesFilmeTMDB`,
            params: { movieId: movie.id },
        });
    };
    
    // ADICIONADO: Função para lidar com a busca
    const handleSearch = (query: string) => {
        if (query.trim()) {
            router.push({ pathname: '/telas/Busca', params: { query } });
        }
    };

    const renderMovieItem = ({ item }: { item: Movie }) => (
        <Pressable style={homeStyles.movieItem} onPress={() => navigateToMovieDetails(item)}>
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={homeStyles.moviePoster} />
            ) : (
                <View style={homeStyles.placeholderPoster}>
                    <Text style={homeStyles.placeholderText} numberOfLines={3}>{item.title}</Text>
                </View>
            )}
        </Pressable>
    );

    if (loading && trendingMovies.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ADICIONADO: Header com a Logo */}
            <View style={homeStyles.header}>
                <Image source={FilmeiaLogo} style={homeStyles.headerLogo} />
            </View>
            
            {/* ADICIONADO: Barra de Pesquisa */}
            <View style={homeStyles.searchContainer}>
                <AntDesign name="search1" size={20} color="#7f8c8d" style={homeStyles.searchIcon} />
                <TextInput
                    placeholder="Pesquisar Filmes na TMDB..."
                    placeholderTextColor="#7f8c8d"
                    style={homeStyles.searchInput}
                    onSubmitEditing={(event) => handleSearch(event.nativeEvent.text)}
                    returnKeyType="search"
                />
            </View>

            <FlatList
                data={trendingMovies}
                renderItem={renderMovieItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={homeStyles.listContainer}
                ListHeaderComponent={
                    <Text style={homeStyles.sectionTitle}>Populares</Text>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            />
        </View>
    );
}

const homeStyles = StyleSheet.create({
    header: {
        paddingTop: 40,
        paddingBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0D1F2D', // Cor de fundo consistente
        alignItems: 'center', // Centraliza a logo
    },
    headerLogo: {
        width: 150,
        height: 50,
        resizeMode: 'contain',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        marginHorizontal: 20,
        marginVertical: 10,
        paddingHorizontal: 15,
        height: 45,
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
    },
    listContainer: {
        paddingHorizontal: 5,
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 20,
        fontWeight: 'bold',
        margin: 10,
    },
    movieItem: {
        flex: 1,
        margin: 5,
        maxWidth: '31%',
        height: 180,
    },
    moviePoster: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    placeholderPoster: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#1A2B3E',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    placeholderText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 12,
    },
});