// aplicativo/app/telas/DetalhesFilmeExterno.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getMovieById, updateMovie, deleteMovie, Movie, MovieStatus } from '../../utils/mockData';

function DetalhesFilmeExterno() {
    const router = useRouter();
    const { movieId } = useLocalSearchParams();

    const [movie, setMovie] = useState<Movie | undefined>(undefined);
    const [titulo, setTitulo] = useState('');
    const [anoLancamento, setAnoLancamento] = useState('');
    const [diretor, setDiretor] = useState('');
    const [duracao, setDuracao] = useState('');
    const [genero, setGenero] = useState('');
    const [statusAvaliacao, setStatusAvaliacao] = useState<MovieStatus | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            if (movieId) {
                const foundMovie = getMovieById(movieId as string);
                if (foundMovie) {
                    setMovie(foundMovie);
                    setTitulo(foundMovie.title);
                    setAnoLancamento(foundMovie.releaseYear || '');
                    setDiretor(foundMovie.director || '');
                    setDuracao(foundMovie.duration || '');
                    setGenero(foundMovie.genre || '');
                    setStatusAvaliacao(foundMovie.status || null);
                } else {
                    Alert.alert('Erro', 'Filme não encontrado.');
                    router.back();
                }
            }
        }, [movieId])
    );

    const handleSave = () => {
        if (!movie) return;

        if (!titulo || !anoLancamento || !diretor || !duracao || !genero || !statusAvaliacao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma avaliação.');
            return;
        }

        const updatedMovie: Movie = {
            ...movie,
            title: titulo,
            releaseYear: anoLancamento,
            director: diretor,
            duration: duracao,
            genre: genero,
            status: statusAvaliacao,
        };

        updateMovie(updatedMovie);
        Alert.alert('Sucesso', 'Filme atualizado com sucesso!');
        router.back();
        // TODO: Em uma implementação real com Firebase, você faria uma chamada para atualizar no Firestore aqui.
    };

    const handleDelete = () => {
        if (!movie) return;

        Alert.alert(
            'Excluir Filme',
            `Tem certeza que deseja excluir o filme "${movie.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => {
                        deleteMovie(movie.id);
                        Alert.alert('Sucesso', 'Filme excluído com sucesso!');
                        router.back();
                        // TODO: Em uma implementação real com Firebase, você faria uma chamada para deletar no Firestore aqui.
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    if (!movie) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={detalhesFilmeStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={detalhesFilmeStyles.headerTitle} numberOfLines={1}>Detalhes do Filme</Text>
                <Pressable onPress={handleDelete}>
                    <AntDesign name="delete" size={24} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={detalhesFilmeStyles.scrollViewContent}>
                {movie.isExternal ? (
                    <View style={detalhesFilmeStyles.externalMoviePlaceholderLarge}>
                        <Text style={detalhesFilmeStyles.externalMovieTextLarge}>Filme Externo</Text>
                    </View>
                ) : (
                    <Image
                        source={movie.posterUrl ? { uri: movie.posterUrl } : require('../../assets/images/filmeia-logo2.png')}
                        style={detalhesFilmeStyles.moviePoster}
                    />
                )}

                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Título"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setTitulo}
                        value={titulo}
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Ano de Lançamento"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setAnoLancamento}
                        value={anoLancamento}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Diretor"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setDiretor}
                        value={diretor}
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Duração (minutos)"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setDuracao}
                        value={duracao}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Gênero"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setGenero}
                        value={genero}
                    />
                </View>

                <Text style={detalhesFilmeStyles.avaliacaoTitle}>Avaliação:</Text>
                <View style={detalhesFilmeStyles.avaliacaoContainer}>
                    <Pressable
                        style={[
                            detalhesFilmeStyles.avaliacaoButton,
                            statusAvaliacao === 'like2' && detalhesFilmeStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('like2')}
                    >
                        <AntDesign name="like2" size={30} color={statusAvaliacao === 'like2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            detalhesFilmeStyles.avaliacaoButton,
                            statusAvaliacao === 'dislike2' && detalhesFilmeStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('dislike2')}
                    >
                        <AntDesign name="dislike2" size={30} color={statusAvaliacao === 'dislike2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            detalhesFilmeStyles.avaliacaoButton,
                            statusAvaliacao === 'staro' && detalhesFilmeStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('staro')}
                    >
                        <AntDesign name="staro" size={30} color={statusAvaliacao === 'staro' ? 'black' : '#eaeaea'} />
                    </Pressable>
                </View>

                <Pressable style={detalhesFilmeStyles.saveButton} onPress={handleSave}>
                    <Text style={styles.textoBotao}>Salvar Alterações</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

export default DetalhesFilmeExterno;

const detalhesFilmeStyles = StyleSheet.create({
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
    moviePoster: {
        width: 150,
        height: 225,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    externalMoviePlaceholderLarge: { // Para a tela de detalhes
        width: 150,
        height: 225,
        borderRadius: 12,
        backgroundColor: '#666666', // Cor cinza
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    externalMovieTextLarge: { // Para a tela de detalhes
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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