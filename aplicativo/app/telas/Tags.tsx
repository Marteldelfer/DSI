// aplicativo/app/telas/Tags.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'; 

import { styles } from '../styles';
import { Movie } from '../../src/models/Movie'; 
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../../src/models/Tag'; 
import { MovieService } from '../../src/services/MovieService';
import { TagService } from '../../src/services/TagService';

function TagsScreen() {
    const router = useRouter();
    const { movieId: paramMovieId } = useLocalSearchParams(); // Pega o movieId dos parâmetros
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false); // NOVO ESTADO: controla o modo de visualização/edição

    const [currentTag, setCurrentTag] = useState<Tag | null>(null);
    const [watchedStatus, setWatchedStatus] = useState<WatchedStatus | undefined>(undefined);
    const [interestStatus, setInterestStatus] = useState<InterestStatus | undefined>(undefined);
    const [rewatchStatus, setRewatchStatus] = useState<RewatchStatus | undefined>(undefined);

    const movieService = MovieService.getInstance();
    const tagService = TagService.getInstance();
    const auth = getAuth();

    // Monitora o estado de autenticação do usuário
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

    // Carrega o filme pré-selecionado e suas tags ao focar na tela
    useFocusEffect(
        useCallback(() => {
            if (currentUser && paramMovieId) {
                const loadMovieAndTags = async () => {
                    setLoading(true);
                    const movie = await movieService.getMovieById(paramMovieId as string);
                    if (movie) {
                        setSelectedMovie(movie);
                        // Carrega as tags existentes para este filme e usuário
                        const tag = tagService.getTagByMovieAndUser(movie.id, currentUser.email!);
                        setCurrentTag(tag || null);
                        setWatchedStatus(tag?.watched);
                        setInterestStatus(tag?.interest);
                        setRewatchStatus(tag?.rewatch);
                    } else {
                        Alert.alert("Erro", "Filme não encontrado para gerenciar tags.");
                        router.back();
                    }
                    setLoading(false);
                };
                loadMovieAndTags();
            } else if (currentUser && !paramMovieId) {
                // Caso a tela seja acessada sem um ID de filme (pode ser um erro ou fluxo não esperado)
                Alert.alert("Erro", "Nenhum filme especificado para gerenciar tags.");
                router.back();
            }
        }, [currentUser, movieService, tagService, paramMovieId])
    );

    const handleSaveTags = () => {
        if (!selectedMovie || !currentUser) {
            Alert.alert("Erro", "Filme ou usuário não especificado para salvar as tags.");
            return;
        }

        const tagData = {
            userId: currentUser.email!,
            movieId: selectedMovie.id,
            watched: watchedStatus,
            interest: interestStatus,
            rewatch: rewatchStatus,
        };

        tagService.addTag(tagData); // addTag faz o upsert (adiciona ou atualiza)

        Alert.alert("Sucesso", "Tags salvas com sucesso!");
        setIsEditMode(false); // Volta para o modo de visualização após salvar
        // Recarregar as tags para garantir que o modo de visualização esteja atualizado
        if (selectedMovie && currentUser) {
            const updatedTag = tagService.getTagByMovieAndUser(selectedMovie.id, currentUser.email!);
            setCurrentTag(updatedTag || null);
        }
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
                        Alert.alert("Sucesso", "Tags excluídas com sucesso!");
                        setCurrentTag(null); // Limpa as tags no estado
                        setWatchedStatus(undefined);
                        setInterestStatus(undefined);
                        setRewatchStatus(undefined);
                        setIsEditMode(false); // Volta para o modo de visualização
                    },
                    style: "destructive",
                },
            ]
        );
    };

    if (loading || !currentUser || !selectedMovie) {
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
                {currentTag && !isEditMode && ( // Mostra o botão de deletar apenas no modo de visualização
                    <Pressable onPress={handleDeleteTags}>
                        <AntDesign name="delete" size={24} color="#FF6347" />
                    </Pressable>
                )}
                {!currentTag && !isEditMode && ( // Placeholder para centralizar o título
                    <View style={{width: 24}} />
                )}
            </View>

            <ScrollView contentContainerStyle={tagsStyles.scrollViewContent}>
                <Text style={tagsStyles.selectedMovieTitle}>
                    Filme: {selectedMovie.title}
                </Text>

                {/* NOVO: Modo de Visualização */}
                {!isEditMode ? (
                    <View style={tagsStyles.viewModeContainer}>
                        <Text style={tagsStyles.sectionTitle}>Suas Tags Atuais:</Text>
                        <View style={tagsStyles.currentTagsDisplay}>
                            <Text style={tagsStyles.tagDisplayText}>
                                **Visualização:** {watchedStatus || 'Não Definido'}
                            </Text>
                            <Text style={tagsStyles.tagDisplayText}>
                                **Interesse:** {interestStatus || 'Não Definido'}
                            </Text>
                            <Text style={tagsStyles.tagDisplayText}>
                                **Reassistir:** {rewatchStatus || 'Não Definido'}
                            </Text>
                        </View>
                        
                        <Pressable style={tagsStyles.editButton} onPress={() => setIsEditMode(true)}>
                            <Text style={styles.textoBotao}>Editar Tags</Text>
                        </Pressable>
                    </View>
                ) : (
                    /* MODO DE EDIÇÃO (era o conteúdo principal da tela) */
                    <View style={tagsStyles.editModeContainer}>
                        <Text style={tagsStyles.sectionTitle}>Definir Tags:</Text>
                        <Text style={tagsStyles.subSectionTitle}>Você assistiu o filme?</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'assistido' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('assistido')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Assisti</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'assistido_old' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('assistido_old')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Assisti faz tempo</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'drop' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('drop')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Saí no meio do filme</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === 'nao_assistido' && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus('nao_assistido')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não Assisti</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, watchedStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Pular</Text>
                            </Pressable>
                        </View>

                        <Text style={tagsStyles.subSectionTitle}>Você tem interesse em filmes como esse?</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === 'sim' && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus('sim')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Tenho interesse</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === 'nao' && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus('nao')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não tenho interesse</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, interestStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Pular</Text>
                            </Pressable>
                        </View>

                        <Text style={tagsStyles.subSectionTitle}>Você voltaria a assistir esse filme?</Text>
                        <View style={tagsStyles.tagOptionsContainer}>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === 'sim' && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus('sim')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Voltaria</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === 'nao' && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus('nao')}
                            >
                                <Text style={tagsStyles.tagButtonText}>Não voltaria</Text>
                            </Pressable>
                            <Pressable
                                style={[tagsStyles.tagButton, rewatchStatus === undefined && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus(undefined)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Pular</Text>
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
    selectedMovieTitle: { // Título do filme selecionado
        color: '#3E9C9C',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        width: '100%',
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
    subSectionTitle: { // Para títulos dentro do modo de edição
        color: '#eaeaea',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
        alignSelf: 'flex-start',
        width: '100%',
    },
    // Removidos estilos relacionados à busca (searchContainer, searchIcon, searchInput, movieSearchResults, movieSearchResultItem, movieSearchResultText)
    
    // NOVO: Estilos para o modo de visualização
    viewModeContainer: {
        width: '100%',
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    currentTagsDisplay: {
        width: '100%',
        backgroundColor: '#2E3D50',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    tagDisplayText: {
        color: '#eaeaea',
        fontSize: 16,
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    // NOVO: Estilos para o modo de edição (anteriormente era o conteúdo principal)
    editModeContainer: {
        width: '100%',
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
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