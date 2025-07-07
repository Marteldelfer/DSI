// aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { getPopularMovies, searchMovies } from '../../src/api/tmdb';
import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
import { styles } from '../styles';

export default function Home() {
    const router = useRouter();
    const movieService = MovieService.getInstance();
    
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadPopularMovies = useCallback(async () => {
        try {
            const movies = await getPopularMovies();
            movies.forEach(movie => movieService.addMovieToLocalStore(movie));
            setPopularMovies(movies);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os filmes populares.');
        } finally {
            setLoading(false);
        }
    }, [movieService]);

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const apiResults = await searchMovies(query);
            apiResults.forEach((movie: Movie) => movieService.addMovieToLocalStore(movie));
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
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={homeStyles.poster} />
            ) : (
                <View style={homeStyles.posterPlaceholder}>
                    <Text style={homeStyles.posterText} numberOfLines={3}>{item.title}</Text>
                </View>
            )}
        </Pressable>
    );

    const renderSearchResultItem = ({ item }: { item: Movie }) => (
        <Pressable style={homeStyles.searchItem} onPress={() => navigateToMovieDetails(item.id)}>
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={homeStyles.searchPoster} />
            ) : (
                <View style={[homeStyles.searchPoster, homeStyles.posterPlaceholder]}>
                    <FontAwesome name="image" size={24} color="#eaeaea" />
                </View>
            )}
            <View style={homeStyles.searchInfo}>
                <Text style={homeStyles.searchTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={homeStyles.searchYear}>{item.releaseYear || 'Sem data'}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* <<<< CORREÇÃO AQUI: Header com a Logo >>>> */}
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
                    <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }}/>
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
                        <Text style={homeStyles.sectionTitle}>Filmes Populares</Text>
                        <FlatList
                            data={popularMovies}
                            renderItem={renderMovieItem}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
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
        alignItems: 'center', // Centraliza a logo
    },
    logo: {
        width: 150, // Ajuste a largura conforme necessário
        height: 40,  // Ajuste a altura conforme necessário
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
        height: 225,
    },
    poster: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    posterPlaceholder: {
        flex: 1,
        backgroundColor: '#4A6B8A',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    posterText: {
        color: '#eaeaea',
        textAlign: 'center',
        fontSize: 12,
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
    emptyText: {
        color: '#b0b0b0',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});