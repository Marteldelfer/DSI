// aplicativo/app/telas/EditarFilmeExterno.tsx
import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Pressable, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    Image, 
    TouchableOpacity,
    Modal, 
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'; 
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles'; 
import { Movie, MovieStatus } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService'; 
import * as ImagePicker from 'expo-image-picker'; 

function EditarFilmeExterno() {
    const router = useRouter();
    const { movieId: paramMovieId } = useLocalSearchParams(); 
    
    const [movie, setMovie] = useState<Movie | null>(null); 
    const [titulo, setTitulo] = useState('');
    const [anoLancamento, setAnoLancamento] = useState('');
    const [duracao, setDuracao] = useState('');
    const [genero, setGenero] = useState('');
    const [sinopse, setSinopse] = useState(''); 
    const [posterUri, setPosterUri] = useState<string | null>(null);

    const [modalFotoVisivel, setModalFotoVisivel] = useState(false);
    const [novaFotoTemp, setNovaFotoTemp] = useState<string | undefined>(undefined);

    const movieService = MovieService.getInstance();

    useFocusEffect(
        useCallback(() => {
            const loadMovieData = async () => { // TORNADO ASYNC
                if (paramMovieId) {
                    const foundMovie = await movieService.getMovieById(paramMovieId as string); // USANDO AWAIT
                    if (foundMovie && foundMovie.isExternal) {
                        setMovie(foundMovie); 
                        setTitulo(foundMovie.title);
                        setAnoLancamento(foundMovie.releaseYear || '');
                        setDuracao(foundMovie.duration?.toString() || ''); // Convertendo number para string
                        setGenero(foundMovie.genre || '');
                        setSinopse(foundMovie.overview || '');
                        setPosterUri(foundMovie.posterUrl || null);
                    } else {
                        Alert.alert('Erro', 'Filme não encontrado ou não é um filme externo para edição.');
                        router.back();
                    }
                } else {
                    Alert.alert('Erro', 'Nenhum filme especificado para edição.');
                    router.back();
                }
            };
            loadMovieData();
        }, [paramMovieId, movieService])
    );

    const pickImageFromGallery = async () => {
        setModalFotoVisivel(false); 
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 3], 
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPosterUri(result.assets[0].uri); 
        }
    };

    const handleAplicarFotoUrl = () => {
        if (novaFotoTemp) {
            setPosterUri(novaFotoTemp); 
        }
        setModalFotoVisivel(false); 
        setNovaFotoTemp(undefined); 
    };

    const handleRemoverFoto = () => {
        Alert.alert(
            "Remover Foto",
            "Tem certeza que deseja remover a foto do pôster?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    onPress: () => {
                        setPosterUri(null); 
                        setModalFotoVisivel(false); 
                        setNovaFotoTemp(undefined); 
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleSaveMovie = async () => { // TORNADO ASYNC
        if (!movie) { 
            Alert.alert('Erro', 'Filme não carregado para edição.');
            return;
        }
        if (!titulo || !anoLancamento || !duracao || !genero || !sinopse) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const updatedMovieData = new Movie({ // Criar um objeto Movie completo para a atualização
            ...movie, 
            id: movie.id, 
            title: titulo,
            releaseYear: anoLancamento,
            director: movie.director, // Mantendo o diretor existente ou null
            duration: parseInt(duracao, 10), // Convertendo para number
            genre: genero,
            overview: sinopse,
            posterUrl: posterUri,
            // isExternal e isTmdb são mantidos do objeto original 'movie'
        });

        try {
            await movieService.updateMovie(updatedMovieData); // USANDO AWAIT
            Alert.alert('Sucesso', 'Filme atualizado com sucesso!');
            router.back();
        } catch (error) {
            console.error("Erro ao salvar alterações do filme:", error);
            Alert.alert('Erro', 'Não foi possível salvar as alterações do filme.');
        }
    };

    const handleDeleteMovie = async () => { // TORNADO ASYNC
        if (!movie) return;

        Alert.alert(
            'Excluir Filme',
            `Tem certeza que deseja excluir o filme "${movie.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => { // Usando async aqui também
                        try {
                            await movieService.deleteMovie(movie.id); // USANDO AWAIT
                            Alert.alert('Sucesso', 'Filme excluído com sucesso!');
                            router.back();
                        } catch (error) {
                            console.error("Erro ao deletar filme:", error);
                            Alert.alert('Erro', 'Não foi possível excluir o filme.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    if (!movie) { 
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" /> 
                <Text style={{color: '#eaeaea', marginTop: 10}}>Carregando detalhes do filme...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={editarFilmeStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={editarFilmeStyles.headerTitle}>Editar Filme Externo</Text>
                <Pressable onPress={handleDeleteMovie}>
                    <AntDesign name="delete" size={24} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={editarFilmeStyles.scrollViewContent}>
                <View style={editarFilmeStyles.posterPreviewArea}> 
                    {posterUri ? (
                        <Image source={{ uri: posterUri }} style={editarFilmeStyles.posterPreviewImage} />
                    ) : (
                        <View style={editarFilmeStyles.posterPlaceholder}>
                            <Text style={editarFilmeStyles.posterPlaceholderText}>Pôster</Text> 
                        </View>
                    )}
                </View>

                <Pressable style={editarFilmeStyles.addPhotoButton} onPress={() => setModalFotoVisivel(true)}>
                    <Text style={editarFilmeStyles.addPhotoButtonText}>Alterar Foto</Text> 
                </Pressable>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalFotoVisivel}
                    onRequestClose={() => setModalFotoVisivel(false)}
                >
                    <View style={editarFilmeStyles.centeredView}>
                        <View style={editarFilmeStyles.modalView}>
                            <Text style={editarFilmeStyles.modalTitle}>Alterar Foto do Pôster</Text>
                            
                            <View style={styles.textInput}>
                                <TextInput
                                    placeholder="Colar URL da foto"
                                    placeholderTextColor={"black"}
                                    style={styles.input}
                                    value={novaFotoTemp}
                                    onChangeText={setNovaFotoTemp}
                                    onSubmitEditing={handleAplicarFotoUrl} 
                                />
                            </View>

                            <TouchableOpacity style={editarFilmeStyles.modalButton} onPress={pickImageFromGallery}>
                                <Text style={editarFilmeStyles.modalButtonText}>Escolher da Galeria</Text>
                            </TouchableOpacity>

                            <Pressable style={[editarFilmeStyles.modalButton, {backgroundColor: '#6C7A89'}]} onPress={handleAplicarFotoUrl}>
                                <Text style={editarFilmeStyles.modalButtonText}>Aplicar URL</Text>
                            </Pressable>

                            {posterUri && ( 
                                <Pressable style={[editarFilmeStyles.modalButton, editarFilmeStyles.modalDeleteButton]} onPress={handleRemoverFoto}>
                                    <Text style={editarFilmeStyles.modalButtonText}>Remover Foto</Text>
                                </Pressable>
                            )}

                            <Pressable style={[editarFilmeStyles.modalButton, editarFilmeStyles.modalCancelButton]} onPress={() => { setModalFotoVisivel(false); setNovaFotoTemp(undefined); }}>
                                <Text style={editarFilmeStyles.modalButtonText}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

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
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Sinopse"
                        placeholderTextColor={"grey"}
                        style={[styles.input, {height: 110, textAlignVertical: 'top', paddingTop: 10}]}
                        multiline={true}
                        onChangeText={setSinopse}
                        value={sinopse}
                    />
                </View>

                <Pressable style={editarFilmeStyles.saveButton} onPress={handleSaveMovie}>
                    <Text style={styles.textoBotao}>Salvar Alterações</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

export default EditarFilmeExterno;

const editarFilmeStyles = StyleSheet.create({
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
    posterPreviewArea: { 
        width: 150,
        height: 225,
        borderRadius: 12,
        backgroundColor: '#4A6B8A', 
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 10, 
    },
    posterPreviewImage: {
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
    posterPlaceholderText: {
        color: '#eaeaea',
        fontSize: 18, 
        fontWeight: 'bold',
    },
    addPhotoButton: { 
        backgroundColor: '#4A6B8A',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 20, 
        width: '80%', 
        alignItems: 'center',
    },
    addPhotoButtonText: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', 
    },
    modalView: {
        margin: 20,
        backgroundColor: '#1a2b3e',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%', 
    },
    modalTitle: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#3E9C9C', 
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'black', 
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalCancelButton: {
        backgroundColor: '#FF6347', 
    },
    modalDeleteButton: { 
        backgroundColor: '#D9534F', 
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