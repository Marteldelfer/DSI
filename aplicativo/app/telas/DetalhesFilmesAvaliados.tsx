// NOVO ARQUIVO: aplicativo/app/telas/DetalhesFilmeAvaliadoTMDB.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Image, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getMovieDetails, TMDBMovie, TMDB_IMAGE_BASE_URL } from '../../src/tmdbApi';
import { Movie, MovieStatus, addOrUpdateRatedMovie, deleteMovie, getMovieById } from '../../utils/mockData';

function DetalhesFilmeAvaliadoTMDB() {
    const router = useRouter();
    const { movieId } = useLocalSearchParams(); // Este será o 'id' do mockData, que pode ser o tmdbId ou um ID externo

    const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);
    const [localMovie, setLocalMovie] = useState<Movie | undefined>(undefined); // O filme como está salvo localmente
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<MovieStatus | null>(null);

    useEffect(() => {
        const fetchMovieData = async () => {
            setLoading(true);
            const foundLocalMovie = getMovieById(movieId as string);
            setLocalMovie(foundLocalMovie);
            setCurrentStatus(foundLocalMovie?.status || null);

            if (foundLocalMovie && foundLocalMovie.tmdbId) {
                // Se é um filme do TMDB avaliado, busca os detalhes completos
                const fetchedTmdbMovie = await getMovieDetails(foundLocalMovie.tmdbId);
                setTmdbMovie(fetchedTmdbMovie);
            } else if (foundLocalMovie && foundLocalMovie.isExternal) {
                // Se é um filme externo, não busca no TMDB, apenas exibe os dados locais
                setTmdbMovie(null); // Garante que tmdbMovie seja nulo para filmes externos
            } else {
                // Caso não encontre ou não tenha tmdbId, pode ser um ID direto do TMDB da tela Home
                const idAsNumber = Number(movieId);
                if (!isNaN(idAsNumber) && idAsNumber > 0) {
                    const fetchedTmdbMovie = await getMovieDetails(idAsNumber);
                    setTmdbMovie(fetchedTmdbMovie);
                } else {
                    Alert.alert('Erro', 'ID de filme inválido ou não encontrado.');
                    router.back();
                }
            }
            setLoading(false);
        };

        if (movieId) {
            fetchMovieData();
        }
    }, [movieId]);

    const handleSaveStatus = (status: MovieStatus) => {
        if (!tmdbMovie && (!localMovie || !localMovie.isExternal)) { // Não tem filme TMDB e não é externo
            Alert.alert("Erro", "Não foi possível salvar o status para este filme.");
            return;
        }

        let movieToSave: Movie;
        if (tmdbMovie) { // É um filme do TMDB
            movieToSave = {
                id: tmdbMovie.id.toString(), // ID do TMDB como string
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title,
                posterUrl: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : null,
                releaseYear: tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : undefined,
                // Outros campos do TMDB podem ser mapeados aqui se quiser salvá-los localmente
                status: status,
                isExternal: false,
            };
        } else if (localMovie && localMovie.isExternal) { // É um filme externo
            movieToSave = {
                ...localMovie,
                status: status,
            };
        } else {
            return; // Não deveria chegar aqui
        }

        addOrUpdateRatedMovie(movieToSave);
        setCurrentStatus(status);
        Alert.alert('Sucesso', `Filme marcado como "${status || 'Não Avaliado'}"!`);
        // Opcional: Navegar de volta ou atualizar a tela anterior
    };

    const handleDeleteMovie = () => {
        if (!localMovie) {
            Alert.alert("Erro", "Não foi possível encontrar o filme para excluir.");
            return;
        }
        Alert.alert(
            'Excluir Filme',
            `Tem certeza que deseja excluir "${localMovie.title}" da sua lista?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => {
                        deleteMovie(localMovie.id);
                        Alert.alert('Sucesso', 'Filme excluído com sucesso!');
                        router.back(); // Volta para a tela anterior (MeusFilmes)
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, detalhesStyles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
                <Text style={detalhesStyles.loadingText}>Carregando detalhes do filme...</Text>
            </View>
        );
    }

    // Determina qual objeto de filme usar para exibição
    const displayMovie = tmdbMovie || localMovie;

    if (!displayMovie) {
        return (
            <View style={[styles.container, detalhesStyles.loadingContainer]}>
                <Text style={detalhesStyles.loadingText}>Filme não encontrado.</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={styles.link}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    const posterPath = tmdbMovie?.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : null;
    const isActuallyExternal = localMovie?.isExternal; // Verifica se é um filme externo do mockData

    return (
        <View style={styles.container}>
            <View style={detalhesStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={detalhesStyles.headerTitle} numberOfLines={1}>{displayMovie.title}</Text>
                {localMovie && ( // Mostrar botão de excluir apenas se for um filme salvo localmente
                    <Pressable onPress={handleDeleteMovie}>
                        <AntDesign name="delete" size={24} color="#FF6347" />
                    </Pressable>
                )}
            </View>

            <ScrollView contentContainerStyle={detalhesStyles.scrollViewContent}>
                {isActuallyExternal ? (
                    <View style={detalhesStyles.externalMoviePlaceholderLarge}>
                        <Text style={detalhesStyles.externalMovieTextLarge}>Filme Externo</Text>
                        <Text style={detalhesStyles.externalMovieTextSmall}>{localMovie.title}</Text>
                        {localMovie.director && <Text style={detalhesStyles.externalMovieTextSmall}>Dirigido por: {localMovie.director}</Text>}
                        {localMovie.releaseYear && <Text style={detalhesStyles.externalMovieTextSmall}>Ano: {localMovie.releaseYear}</Text>}
                        {localMovie.genre && <Text style={detalhesStyles.externalMovieTextSmall}>Gênero: {localMovie.genre}</Text>}
                        {localMovie.duration && <Text style={detalhesStyles.externalMovieTextSmall}>Duração: {localMovie.duration} min</Text>}
                    </View>
                ) : (
                    <Image
                        source={posterPath ? { uri: posterPath } : require('../../assets/images/filmeia-logo2.png')}
                        style={detalhesStyles.moviePoster}
                        resizeMode="cover"
                    />
                )}

                {!isActuallyExternal && tmdbMovie && (
                    <>
                        <Text style={detalhesStyles.detailText}>**Ano de Lançamento:** {tmdbMovie.release_date?.substring(0, 4) || 'N/A'}</Text>
                        <Text style={detalhesStyles.detailText}>**Nota Média TMDB:** {tmdbMovie.vote_average?.toFixed(1) || 'N/A'}</Text>
                        {/* Você pode adicionar mais detalhes aqui, como diretor, duração, etc.
                            Para diretor e duração, você precisaria fazer uma chamada adicional para `getMovieDetails`
                            ou modificar a interface `TMDBMovie` para incluir esses campos se a API popular/search já os retornar.
                        */}
                        <Text style={detalhesStyles.overviewTitle}>Sinopse:</Text>
                        <Text style={detalhesStyles.overviewText}>{tmdbMovie.overview || 'Sinopse não disponível.'}</Text>
                    </>
                )}

                {isActuallyExternal && (
                     <Pressable style={detalhesStyles.editExternalButton} onPress={() => Alert.alert("Editar Filme", "Funcionalidade de edição de filmes externos será implementada em DetalhesFilmeExterno.tsx")}>
                        <Text style={styles.textoBotao}>Editar Filme Externo</Text>
                    </Pressable>
                )}

                <Text style={detalhesStyles.avaliacaoTitle}>Avaliar Filme:</Text>
                <View style={detalhesStyles.avaliacaoContainer}>
                    <Pressable
                        style={[
                            detalhesStyles.avaliacaoButton,
                            currentStatus === 'like2' && detalhesStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => handleSaveStatus('like2')}
                    >
                        <AntDesign name="like2" size={30} color={currentStatus === 'like2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            detalhesStyles.avaliacaoButton,
                            currentStatus === 'dislike2' && detalhesStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => handleSaveStatus('dislike2')}
                    >
                        <AntDesign name="dislike2" size={30} color={currentStatus === 'dislike2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            detalhesStyles.avaliacaoButton,
                            currentStatus === 'staro' && detalhesStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => handleSaveStatus('staro')}
                    >
                        <AntDesign name="staro" size={30} color={currentStatus === 'staro' ? 'black' : '#eaeaea'} />
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

export default DetalhesFilmeAvaliadoTMDB;

const detalhesStyles = StyleSheet.create({
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#eaeaea',
        marginTop: 10,
        fontSize: 16,
    },
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
        textAlign: 'center',
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    moviePoster: {
        width: 200,
        height: 300,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'contain', // Ajustar conforme a necessidade
        backgroundColor: '#1A2B3E' // Cor de fundo para posters que não preenchem
    },
    externalMoviePlaceholderLarge: {
        width: 200,
        height: 300,
        borderRadius: 12,
        backgroundColor: '#4A6B8A', // Cor cinza para o placeholder de filme externo
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
    },
    externalMovieTextLarge: {
        color: '#eaeaea',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    externalMovieTextSmall: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
    detailText: {
        color: '#eaeaea',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    overviewTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
        width: '100%',
    },
    overviewText: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'justify',
    },
    avaliacaoTitle: {
        color: "#eaeaea",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'center',
    },
    avaliacaoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginBottom: 20,
    },
    avaliacaoButton: {
        backgroundColor: '#1A2B3E',
        padding: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4A6B8A',
    },
    avaliacaoButtonSelected: {
        backgroundColor: '#3E9C9C',
        borderColor: '#3E9C9C',
    },
    editExternalButton: {
        backgroundColor: '#4A6B8A',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    }
});