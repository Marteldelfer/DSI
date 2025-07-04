// aplicativo/app/telas/Tags.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { styles } from '../styles';
import { Movie } from '../../src/models/Movie';
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../../src/models/Tag';
import { MovieService } from '../../src/services/MovieService';
import { TagService } from '../../src/services/TagService';

function TagsScreen() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieSearchTerm, setMovieSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

    const [currentTag, setCurrentTag] = useState<Tag | null>(null);
    const [watchedStatus, setWatchedStatus] = useState<WatchedStatus | undefined>(undefined);
    const [interestStatus, setInterestStatus] = useState<InterestStatus | undefined>(undefined);
    const [rewatchStatus, setRewatchStatus] = useState<RewatchStatus | undefined>(undefined);
    const [loading, setLoading] = useState(true);

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
                    Alert.alert("Acesso Negado", "Você precisa estar logado para acessar as tags.");
                    router.replace('/telas/Login');
                }
            });
            return () => unsubscribe();
        }, [auth, router])
    );

    useFocusEffect(
        useCallback(() => {
            if (currentUser) {
                setLoading(true);
                const movies = movieService.getAllMovies();
                setAllMovies(movies);
                setFilteredMovies(movies);
                setLoading(false);
            }
        }, [currentUser, movieService])
    );

    const fetchTagForSelectedMovie = useCallback(() => {
        if (selectedMovie && currentUser) {
            const tag = tagService.getTagByMovieAndUser(selectedMovie.id, currentUser.email!);
            setCurrentTag(tag || null);
            setWatchedStatus(tag?.watched);
            setInterestStatus(tag?.interest);
            setRewatchStatus(tag?.rewatch);
        } else {
            setCurrentTag(null);
            setWatchedStatus(undefined);
            setInterestStatus(undefined);
            setRewatchStatus(undefined);
        }
    }, [selectedMovie, currentUser, tagService]);

    useFocusEffect(
        useCallback(() => {
            fetchTagForSelectedMovie();
        }, [fetchTagForSelectedMovie])
    );

    const handleSearchMovie = () => {
        if (movieSearchTerm.trim()) {
            const filtered = allMovies.filter(movie =>
                movie.title.toLowerCase().includes(movieSearchTerm.toLowerCase())
            );
            setFilteredMovies(filtered);
        } else {
            setFilteredMovies(allMovies);
        }
        setSelectedMovie(null);
        setCurrentTag(null);
    };

    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setMovieSearchTerm(movie.title);
        setFilteredMovies([]);
    };

    const handleSaveTags = () => {
        if (!selectedMovie || !currentUser) {
            Alert.alert("Erro", "Selecione um filme e esteja logado para salvar as tags.");
            return;
        }

        const tagData = {
            userId: currentUser.email!,
            movieId: selectedMovie.id,
            watched: watchedStatus,
            interest: interestStatus,
            rewatch: rewatchStatus,
        };

        tagService.addTag(tagData);

        Alert.alert("Sucesso", "Tags salvas com sucesso!");
        fetchTagForSelectedMovie();
    };

    const handleDeleteTags = () => {
        if (!currentTag) {
            Alert.alert("Erro", "Nenhuma tag para excluir.");
            return;
        }
        Alert.alert(
            "Excluir Tags",
            `Tem certeza que deseja excluir as tags para "${selectedMovie?.title}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: () => {
                        tagService.deleteTag(currentTag.id);
                        setSelectedMovie(null);
                        setMovieSearchTerm('');
                        setCurrentTag(null);
                        setWatchedStatus(undefined);
                        setInterestStatus(undefined);
                        setRewatchStatus(undefined);
                        Alert.alert("Sucesso", "Tags excluídas com sucesso!");
                    },
                    style: "destructive",
                },
            ]
        );
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
            <View style={tagsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={tagsStyles.headerTitle}>Gerenciar Tags</Text>
                {currentTag && (
                    <Pressable onPress={handleDeleteTags}>
                        <AntDesign name="delete" size={24} color="#FF6347" />
                    </Pressable>
                )}
            </View>

            <ScrollView contentContainerStyle={tagsStyles.scrollViewContent}>
                <Text style={tagsStyles.sectionTitle}>Buscar Filme:</Text>
                <View style={tagsStyles.searchContainer}> {/* CORREÇÃO: Usar tagsStyles */}
                    <AntDesign name="search1" size={20} color="#7f8c8d" style={tagsStyles.searchIcon} /> {/* CORREÇÃO: Usar tagsStyles */}
                    <TextInput
                        placeholder="Buscar filme por título..."
                        placeholderTextColor="#7f8c8d"
                        style={tagsStyles.searchInput}
                        onChangeText={setMovieSearchTerm}
                        value={movieSearchTerm}
                        onEndEditing={handleSearchMovie}
                    />
                </View>

                {filteredMovies.length > 0 && movieSearchTerm.length > 0 && !selectedMovie && (
                    <View style={tagsStyles.movieSearchResults}>
                        {filteredMovies.map((movie) => (
                            <Pressable key={movie.id} style={tagsStyles.movieSearchResultItem} onPress={() => handleSelectMovie(movie)}>
                                <Text style={tagsStyles.movieSearchResultText}>{movie.title}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {selectedMovie && (
                    <View style={tagsStyles.selectedMovieContainer}>
                        <Text style={tagsStyles.selectedMovieTitle}>Filme Selecionado: {selectedMovie.title}</Text>
                        <Text style={tagsStyles.sectionTitle}>Status de Visualização:</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'assistido' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('assistido')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Assistido</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'assistido_old' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('assistido_old')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Assistido (Antigo)</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'drop' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('drop')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Desisti</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'nao_assistido' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('nao_assistido')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não Assistido</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Limpar</Text>
                            </Pressable>
                        </View>

                        <Text style={tagsStyles.sectionTitle}>Interesse:</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === 'sim' && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus('sim')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Sim</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === 'nao' && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus('nao')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Limpar</Text>
                            </Pressable>
                        </View>

                        <Text style={tagsStyles.sectionTitle}>Reassistir:</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === 'sim' && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus('sim')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Sim</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === 'nao' && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus('nao')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Limpar</Text>
                            </Pressable>
                        </View>

                        <Pressable style={tagsStyles.saveButton} onPress={handleSaveTags}>
                            <Text style={styles.textoBotao}>Salvar Tags</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

export default TagsScreen;

const tagsStyles = StyleSheet.create({
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
        flex: 1,
        marginHorizontal: 15,
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
        width: '100%',
    },
    // CORREÇÃO: Estilos de busca adicionados ou verificados aqui
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 20,
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
        height: 40,
    },
    movieSearchResults: {
        backgroundColor: '#1A2B3E',
        borderRadius: 8,
        width: '100%',
        marginTop: 10,
        maxHeight: 200,
        borderColor: '#4A6B8A',
        borderWidth: 1,
    },
    movieSearchResultItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#4A6B8A',
    },
    movieSearchResultText: {
        color: '#eaeaea',
        fontSize: 16,
    },
    selectedMovieContainer: {
        width: '100%',
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        alignItems: 'center',
    },
    selectedMovieTitle: {
        color: '#3E9C9C',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    tagOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 10,
    },
    tagButton: {
        backgroundColor: '#4A6B8A',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        margin: 5,
    },
    tagButtonSelected: {
        backgroundColor: '#3E9C9C',
        borderColor: '#3E9C9C',
        borderWidth: 2,
    },
    tagButtonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
});