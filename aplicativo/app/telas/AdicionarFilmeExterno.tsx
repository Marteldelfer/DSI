// aplicativo/app/telas/AdicionarFilmeExterno.tsx
import React, { useState } from 'react';
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
    Platform,
    ActionSheetIOS,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { Movie, MovieStatus } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService'; // Certifique-se que MovieService está importado
import * as ImagePicker from 'expo-image-picker';

function AdicionarFilmeExterno() {
    const router = useRouter();
    const [titulo, setTitulo] = useState('');
    const [anoLancamento, setAnoLancamento] = useState('');
    const [duracao, setDuracao] = useState('');
    const [genero, setGenero] = useState('');
    const [sinopse, setSinopse] = useState('');
    const [posterUri, setPosterUri] = useState<string | null>(null);

    const [modalFotoVisivel, setModalFotoVisivel] = useState(false);
    const [novaFotoTemp, setNovaFotoTemp] = useState<string | undefined>(undefined);

    const movieService = MovieService.getInstance();

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

    const promptForUrl = () => {
        Alert.prompt(
            "Colar URL do Pôster",
            "Insira o link direto para a imagem do pôster:",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: (url) => url && setPosterUri(url),
                },
            ],
            "plain-text"
        );
    };

    const handleAddPhotoOptions = () => {
        const options = ["Escolher da Galeria", "Colar URL"];
        const cancelButtonIndex = 2;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: options,
                    cancelButtonIndex: cancelButtonIndex,
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        pickImageFromGallery();
                    } else if (buttonIndex === 1) {
                        promptForUrl();
                    }
                }
            );
        } else {
            Alert.alert(
                "Adicionar Foto do Pôster",
                "Escolha uma opção:",
                [
                    { text: "Escolher da Galeria", onPress: pickImageFromGallery },
                    { text: "Colar URL", onPress: promptForUrl },
                ],
                { cancelable: true }
            );
        }
    };

    const handleAplicarFotoUrl = () => {
        if (novaFotoTemp) {
            setPosterUri(novaFotoTemp);
        }
        setModalFotoVisivel(false);
        setNovaFotoTemp(undefined);
    };

    const handleSaveAndEvaluate = async () => {
        if (!titulo || !anoLancamento || !duracao || !genero || !sinopse) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios antes de avaliar.');
            return;
        }

        let finalPosterUrl: string | null = null;
        if (posterUri) {
            try {
                // Ao criar um filme externo, o ID ainda não existe, então usaremos um placeholder
                // O MovieService terá a lógica para lidar com isso ou você pode gerar um UUID temporário aqui
                finalPosterUrl = await movieService.uploadMoviePoster(posterUri, `new-movie-${Date.now()}`);
            } catch (error) {
                console.error("Erro ao fazer upload do pôster:", error);
                Alert.alert('Erro', 'Não foi possível fazer upload da imagem do pôster.');
                return;
            }
        }

        try {
            const newExternalMovie = await movieService.createExternalMovie({
                title: titulo,
                releaseYear: anoLancamento,
                director: "Não informado",
                duration: parseInt(duracao, 10),
                genre: genero,
                overview: sinopse,
                posterUrl: finalPosterUrl, // Usa a URL pública do Supabase
            });

            Alert.alert('Sucesso', 'Filme adicionado! Agora avalie-o.');
            router.replace({
                pathname: "/telas/CriarAvaliacao",
                params: { movieId: newExternalMovie.id },
            });
        } catch (error) {
            console.error("Erro ao salvar filme externo:", error);
            Alert.alert('Erro', 'Não foi possível adicionar o filme externo.');
        }
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
                <View style={addExternalMovieStyles.posterPreviewArea}>
                    {posterUri ? (
                        <Image source={{ uri: posterUri }} style={addExternalMovieStyles.posterPreviewImage} />
                    ) : (
                        <View style={addExternalMovieStyles.posterPlaceholder}>
                            <Text style={addExternalMovieStyles.posterPlaceholderText}>Pôster</Text>
                        </View>
                    )}
                </View>

                <Pressable style={addExternalMovieStyles.addPhotoButton} onPress={() => setModalFotoVisivel(true)}>
                    <Text style={addExternalMovieStyles.addPhotoButtonText}>Adicionar Foto</Text>
                </Pressable>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalFotoVisivel}
                    onRequestClose={() => setModalFotoVisivel(false)}
                >
                    <View style={addExternalMovieStyles.centeredView}>
                        <View style={addExternalMovieStyles.modalView}>
                            <Text style={addExternalMovieStyles.modalTitle}>Adicionar Foto do Pôster</Text>

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

                            <TouchableOpacity style={addExternalMovieStyles.modalButton} onPress={pickImageFromGallery}>
                                <Text style={addExternalMovieStyles.modalButtonText}>Escolher da Galeria</Text>
                            </TouchableOpacity>

                            <Pressable style={[addExternalMovieStyles.modalButton, {backgroundColor: '#6C7A89'}]} onPress={handleAplicarFotoUrl}>
                                <Text style={addExternalMovieStyles.modalButtonText}>Aplicar URL</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Título"
                        placeholderTextColor={"grey"}
                        style={styles.input}
                        onChangeText={setTitulo}
                        value={titulo}
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Ano de Lançamento"
                        placeholderTextColor={"grey"}
                        style={styles.input}
                        onChangeText={setAnoLancamento}
                        value={anoLancamento}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Duração (minutos)"
                        placeholderTextColor={"grey"}
                        style={styles.input}
                        onChangeText={setDuracao}
                        value={duracao}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.textInput}>
                    <TextInput
                        placeholder="Gênero"
                        placeholderTextColor={"grey"}
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

                <Pressable style={addExternalMovieStyles.evaluateButton} onPress={handleSaveAndEvaluate}>
                    <AntDesign name="staro" size={20} color="#eaeaea" />
                    <Text style={addExternalMovieStyles.evaluateButtonText}>Salvar e Avaliar Filme</Text>
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
    evaluateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3E9C9C",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 30,
        width: '80%',
        justifyContent: 'center',
    },
    evaluateButtonText: {
        color: "#eaeaea",
        marginLeft: 10,
        fontWeight: "bold",
        fontSize: 16,
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