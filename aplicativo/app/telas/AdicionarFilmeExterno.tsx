// aplicativo/app/telas/AdicionarFilmeExterno.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
// IMPORTANTE: Remova a importação de 'addExternalMovie' e 'MovieStatus' de '../../utils/mockData'
// import { addExternalMovie, MovieStatus } from '../../utils/mockData';
import * as ImagePicker from 'expo-image-picker';

// Importe as novas classes e serviços
import { Movie, MovieStatus } from '../../src/models/Movie'; // Importe Movie e MovieStatus da nova localização
import { MovieService } from '../../src/services/MovieService'; // Importe o MovieService

function AdicionarFilmeExterno() {
    const router = useRouter();
    const [titulo, setTitulo] = useState('');
    const [anoLancamento, setAnoLancamento] = useState('');
    const [diretor, setDiretor] = useState('');
    const [duracao, setDuracao] = useState('');
    const [genero, setGenero] = useState('');
    const [posterUri, setPosterUri] = useState<string | null>(null);
    const [statusAvaliacao, setStatusAvaliacao] = useState<MovieStatus | null>(null);

    // Crie uma instância do MovieService
    const movieService = MovieService.getInstance();

    // Função para selecionar imagem da galeria
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 3], // Proporção de um pôster de filme típico (largura:altura)
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPosterUri(result.assets[0].uri);
        }
    };

    const handleSaveMovie = () => {
        if (!titulo || !anoLancamento || !diretor || !duracao || !genero || !statusAvaliacao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma avaliação para adicionar o filme.');
            return;
        }

        // Não precisa mais criar um ID aqui, o serviço cuidará disso.
        // O MovieService.addExternalMovie agora recebe apenas os dados crus do filme.
        movieService.addExternalMovie({
            title: titulo,
            releaseYear: anoLancamento,
            director: diretor,
            duration: duracao,
            genre: genero,
            posterUrl: posterUri,
            status: statusAvaliacao,
            // As flags isExternal e isTmdb são definidas dentro do addExternalMovie do serviço.
        });

        Alert.alert('Sucesso', 'Filme adicionado com sucesso!');
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={addExternalMovieStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={addExternalMovieStyles.headerTitle}>Adicionar Filme Externo</Text>
                <AntDesign name="delete" size={24} color="transparent" />
            </View>

            <ScrollView contentContainerStyle={addExternalMovieStyles.scrollViewContent}>
                {/* Pré-visualização do Poster ou Placeholder */}
                {posterUri ? (
                    <Image source={{ uri: posterUri }} style={addExternalMovieStyles.posterPreview} />
                ) : (
                    <View style={addExternalMovieStyles.posterPlaceholder}>
                        <Text style={addExternalMovieStyles.posterPlaceholderText}>Adicionar Foto</Text>
                    </View>
                )}

                {/* Input para URL do Poster */}
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Link do Poster (URL)"
                        placeholderTextColor={"black"}
                        style={styles.input}
                        onChangeText={setPosterUri}
                        value={posterUri || ''}
                    />
                </View>

                {/* Botão para Upload da Galeria */}
                <TouchableOpacity style={addExternalMovieStyles.uploadButton} onPress={pickImage}>
                    <Text style={addExternalMovieStyles.uploadButtonText}>Escolher Pôster da Galeria</Text>
                </TouchableOpacity>

                {/* Campos de texto existentes */}
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

                <Text style={addExternalMovieStyles.avaliacaoTitle}>Avaliar Filme:</Text>
                <View style={addExternalMovieStyles.avaliacaoContainer}>
                    <Pressable
                        style={[
                            addExternalMovieStyles.avaliacaoButton,
                            statusAvaliacao === 'like2' && addExternalMovieStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('like2')}
                    >
                        <AntDesign name="like2" size={30} color={statusAvaliacao === 'like2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            addExternalMovieStyles.avaliacaoButton,
                            statusAvaliacao === 'dislike2' && addExternalMovieStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('dislike2')}
                    >
                        <AntDesign name="dislike2" size={30} color={statusAvaliacao === 'dislike2' ? 'black' : '#eaeaea'} />
                    </Pressable>
                    <Pressable
                        style={[
                            addExternalMovieStyles.avaliacaoButton,
                            statusAvaliacao === 'staro' && addExternalMovieStyles.avaliacaoButtonSelected,
                        ]}
                        onPress={() => setStatusAvaliacao('staro')}
                    >
                        <AntDesign name="staro" size={30} color={statusAvaliacao === 'staro' ? 'black' : '#eaeaea'} />
                    </Pressable>
                </View>

                <Pressable style={addExternalMovieStyles.saveButton} onPress={handleSaveMovie}>
                    <Text style={styles.textoBotao}>Salvar</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

export default AdicionarFilmeExterno;

const addExternalMovieStyles = StyleSheet.create({
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
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },
    posterPreview: {
        width: 150,
        height: 225,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'cover',
        backgroundColor: '#4A6B8A',
    },
    posterPlaceholder: {
        width: 150,
        height: 225,
        borderRadius: 12,
        backgroundColor: '#4A6B8A', // Cor de fundo semelhante à do protótipo
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    posterPlaceholderText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
    },
    uploadButton: {
        backgroundColor: '#4A6B8A',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
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