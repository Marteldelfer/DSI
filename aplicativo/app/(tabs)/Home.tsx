// aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, Pressable, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
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

    const loadPopularMovies = useCallback(async () => { // TORNADO ASYNC
        try {
            // USANDO AWAIT para chamar o MovieService, que agora busca status do ReviewService
            const movies = await movieService.getPopularMovies(); 
            setPopularMovies(movies);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar as recomendações.');
        } finally {
            setLoading(false);
        }
    }, [movieService]);

    const handleSearch = useCallback(async (query: string) => { // TORNADO ASYNC
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            // USANDO AWAIT para chamar o MovieService, que agora busca status do ReviewService
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
            <Text style={homeStyles.movieTitle} numberOfLines={3}>{item.title}</Text>
             {/* NOVO: Exibir o status da avaliação no card */}
             {item.status && (
                <View style={homeStyles.movieStatusOverlay}>
                    <AntDesign name={item.status} size={20} color="#FFD700" />
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
            {/* NOVO: Exibir o status da avaliação no item de busca */}
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
                        <Text style={homeStyles.sectionTitle}>Recomendações</Text>
                        <FlatList
                            data={popularMovies}
                            renderItem={renderMovieItem}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* Seção de Perfil Cinematográfico */}
                    <View style={homeStyles.section}>
                        <Text style={homeStyles.sectionTitle}>Seu Perfil Cinematográfico</Text>
                        <View style={homeStyles.cinematicProfileContainer}>
                            <Image 
                                source={require('../../assets/images/stats.png')} 
                                style={homeStyles.singleGraphSketchImage} 
                                resizeMode="contain" 
                            />
                        </View>
                        <Text style={homeStyles.disclaimerText}>
                            (Funcionalidade em desenvolvimento)
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
        marginBottom: 40, 
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
        height: 270, 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        position: 'relative', // Para o ícone de status
    },
    poster: {
        width: '100%',
        height: 225, 
        borderRadius: 10,
        resizeMode: 'cover', 
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
    movieTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5, 
        width: '100%', 
    },
    movieStatusOverlay: { // NOVO: Estilo para o status no card de filme
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
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
    searchStatusIcon: { // NOVO: Estilo para o status no item de busca
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
        minHeight: 120, 
    },
    singleGraphSketchImage: {
        width: '90%', 
        height: 100, 
        resizeMode: 'contain',
    },
    disclaimerText: {
        color: '#b0b0b0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 20,
    },
});