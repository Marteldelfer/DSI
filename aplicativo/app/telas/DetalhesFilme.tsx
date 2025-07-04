// aplicativo/app/telas/DetalhesFilmeExterno.tsx
import React, { useState, useEffect } from 'react'; //
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Image } from 'react-native'; //
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'; //
import { AntDesign } from '@expo/vector-icons'; //
import { styles } from '../styles'; //
import { getMovieById, updateMovie, deleteMovie, Movie, MovieStatus } from '../../utils/mockData'; //

function DetalhesFilmeExterno() {
    const router = useRouter(); //
    const { movieId } = useLocalSearchParams(); //

    const [movie, setMovie] = useState<Movie | undefined>(undefined); //
    const [titulo, setTitulo] = useState(''); //
    const [anoLancamento, setAnoLancamento] = useState(''); //
    const [diretor, setDiretor] = useState(''); //
    const [duracao, setDuracao] = useState(''); //
    const [genero, setGenero] = useState(''); //
    const [posterUrl, setPosterUrl] = useState<string | null>(null); // Adicionado para o poster
    const [statusAvaliacao, setStatusAvaliacao] = useState<MovieStatus | null>(null); //

    useFocusEffect(
        React.useCallback(() => {
            if (movieId) { //
                const foundMoviePromise = getMovieById(movieId as string); //
                if (foundMoviePromise) { //
                    // Como getMovieById retorna uma Promise, precisamos esperar por ela.
                    foundMoviePromise.then(resolvedMovie => { //
                        if (resolvedMovie) { //
                            setMovie(resolvedMovie); //
                            setTitulo(resolvedMovie.title); //
                            setAnoLancamento(resolvedMovie.releaseYear || ''); //
                            setDiretor(resolvedMovie.director || ''); //
                            setDuracao(resolvedMovie.duration || ''); //
                            setGenero(resolvedMovie.genre || ''); //
                            setPosterUrl(resolvedMovie.posterUrl || null); // Carregar posterUrl
                            setStatusAvaliacao(resolvedMovie.status || null); //
                        } else {
                            Alert.alert('Erro', 'Filme não encontrado.'); //
                            router.back(); //
                        }
                    });
                } else {
                    Alert.alert('Erro', 'Filme não encontrado.'); //
                    router.back(); //
                }
            }
        }, [movieId])
    );

    const handleSave = () => {
        if (!movie) return; //

        if (!titulo || !anoLancamento || !diretor || !duracao || !genero || !statusAvaliacao) { //
            Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma avaliação.'); //
            return;
        }

        const updatedMovie: Movie = {
            ...movie, //
            title: titulo, //
            releaseYear: anoLancamento, //
            director: diretor, //
            duration: duracao, //
            genre: genero, //
            posterUrl: posterUrl, // Salvar o posterUrl
            status: statusAvaliacao, //
        };

        updateMovie(updatedMovie); //
        Alert.alert('Sucesso', 'Filme atualizado com sucesso!'); //
        router.back(); //
    };

    const handleDelete = () => {
        if (!movie) return; //

        Alert.alert(
            'Excluir Filme',
            `Tem certeza que deseja excluir o filme "${movie.title}"?`, //
            [
                { text: 'Cancelar', style: 'cancel' }, //
                {
                    text: 'Excluir',
                    onPress: () => {
                        deleteMovie(movie.id); //
                        Alert.alert('Sucesso', 'Filme excluído com sucesso!'); //
                        router.back(); //
                    },
                    style: 'destructive', //
                },
            ]
        );
    };

    if (!movie) { //
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>Carregando...</Text>
            </View>
        );
    }

    const displayTitle = movie.title;
    const displayYear = movie.releaseYear ? ` (${movie.releaseYear})` : '';
    const placeholderText = `${displayTitle}${displayYear}`;

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
                {posterUrl ? (
                    <Image
                        source={{ uri: posterUrl }}
                        style={detalhesFilmeStyles.moviePoster}
                    />
                ) : (
                    <View style={detalhesFilmeStyles.externalMoviePlaceholderLarge}>
                         <Text style={detalhesFilmeStyles.externalMoviePlaceholderTextLarge} numberOfLines={3}>{placeholderText}</Text>
                    </View>
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
                {/* Adicionado input para URL do Poster */}
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="URL do Poster"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setPosterUrl}
                        value={posterUrl || ''}
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
    externalMoviePlaceholderLarge: {
        width: 150,
        height: 225,
        borderRadius: 12,
        backgroundColor: '#4A6B8A', // Cor de fundo do placeholder
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    externalMoviePlaceholderTextLarge: {
        color: '#eaeaea',
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