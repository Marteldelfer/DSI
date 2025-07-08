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

// Mapeamentos para os rótulos de exibição das tags
const watchedStatusLabels: Record<WatchedStatus, string> = {
    'assistido': 'Assisti',
    'assistido_old': 'Assisti faz tempo',
    'drop': 'Saí no meio do filme',
    'nao_assistido': 'Não Assisti',
};

const interestStatusLabels: Record<InterestStatus, string> = {
    'sim': 'Tenho interesse',
    'nao': 'Não tenho interesse',
};

const rewatchStatusLabels: Record<RewatchStatus, string> = {
    'sim': 'Voltaria',
    'nao': 'Não voltaria',
};

// Função auxiliar para obter o rótulo de exibição
const getTagDisplayLabel = (status: WatchedStatus | InterestStatus | RewatchStatus | null, type: 'watched' | 'interest' | 'rewatch'): string => {
    if (status === null) {
        return 'Não Definido';
    }
    switch (type) {
        case 'watched':
            return watchedStatusLabels[status as WatchedStatus] || 'Não Definido';
        case 'interest':
            return interestStatusLabels[status as InterestStatus] || 'Não Definido';
        case 'rewatch':
            return rewatchStatusLabels[status as RewatchStatus] || 'Não Definido';
        default:
            return 'Não Definido';
    }
};


function TagsScreen() {
    const router = useRouter();
    const { movieId: paramMovieId } = useLocalSearchParams<{ movieId: string }>();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const [currentTag, setCurrentTag] = useState<Tag | null>(null);
    const [watchedStatus, setWatchedStatus] = useState<WatchedStatus | null>(null);
    const [interestStatus, setInterestStatus] = useState<InterestStatus | null>(null);
    const [rewatchStatus, setRewatchStatus] = useState<RewatchStatus | null>(null);

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
    const loadMovieAndTags = useCallback(async () => {
        console.log("TagsScreen: loadMovieAndTags - currentUser:", currentUser?.uid, " | paramMovieId:", paramMovieId);
        if (!currentUser || !paramMovieId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const movie = await movieService.getMovieById(paramMovieId);
            if (movie) {
                setSelectedMovie(movie);
                const tag = await tagService.getTagForMovie(movie.id);
                setCurrentTag(tag || null);
                setWatchedStatus(tag?.watched || null);
                setInterestStatus(tag?.interest || null);
                setRewatchStatus(tag?.rewatch || null);
            } else {
                Alert.alert("Erro", "Filme não encontrado para gerenciar tags.");
                router.back();
            }
        } catch (error) {
            console.error("TagsScreen: Erro ao carregar dados na tela de Tags:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados das tags.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, movieService, tagService, paramMovieId, router]);

    // Chama loadMovieAndTags quando o usuário autentica ou o movieId muda
    useFocusEffect(
        useCallback(() => {
            if (currentUser && paramMovieId) {
                loadMovieAndTags();
            }
        }, [currentUser, paramMovieId, loadMovieAndTags])
    );

    const handleSaveTags = async () => {
        console.log("TagsScreen: handleSaveTags - currentUser:", currentUser?.uid, " | selectedMovie.id:", selectedMovie?.id);
        if (!selectedMovie || !currentUser) {
            Alert.alert("Erro", "Filme ou usuário não especificado para salvar as tags.");
            return;
        }

        setLoading(true);
        const tagData = {
            movieId: selectedMovie.id,
            watched: watchedStatus,
            interest: interestStatus,
            rewatch: rewatchStatus,
        };

        try {
            if (currentTag) {
                await tagService.updateTag(currentTag.id, tagData);
            } else {
                await tagService.createTag(tagData);
            }
            Alert.alert("Sucesso", "Tags salvas com sucesso!");
            setIsEditMode(false);
            await loadMovieAndTags();
        } catch (error) {
            console.error("TagsScreen: Erro ao salvar tags:", error);
            Alert.alert("Erro", "Não foi possível salvar as tags.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTags = async () => {
        console.log("TagsScreen: handleDeleteTags - currentUser:", currentUser?.uid, " | currentTag.id:", currentTag?.id);
        if (!currentTag || !selectedMovie) {
            Alert.alert("Erro", "Nenhuma tag para excluir.");
            return;
        }
        Alert.alert(
            "Excluir Tags",
            `Tem certeza que deseja excluir as tags para "${selectedMovie.title}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await tagService.deleteTag(currentTag.id);
                            Alert.alert("Sucesso", "Tags excluídas com sucesso!");
                            setCurrentTag(null);
                            setWatchedStatus(null);
                            setInterestStatus(null);
                            setRewatchStatus(null);
                            setIsEditMode(false);
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível remover as tags.");
                        } finally {
                            setLoading(false);
                        }
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
                {currentTag && !isEditMode && (
                    <Pressable onPress={handleDeleteTags}>
                        <AntDesign name="delete" size={24} color="#FF6347" />
                    </Pressable>
                )}
                {!currentTag && !isEditMode && (
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
                                **Visualização:** {getTagDisplayLabel(watchedStatus, 'watched')}
                            </Text>
                            <Text style={tagsStyles.tagDisplayText}>
                                **Interesse:** {getTagDisplayLabel(interestStatus, 'interest')}
                            </Text>
                            <Text style={tagsStyles.tagDisplayText}>
                                **Reassistir:** {getTagDisplayLabel(rewatchStatus, 'rewatch')}
                            </Text>
                        </View>
                        
                        <Pressable style={tagsStyles.editButton} onPress={() => setIsEditMode(true)}>
                            <Text style={styles.textoBotao}>Editar Tags</Text>
                        </Pressable>
                    </View>
                ) : (
                    /* MODO DE EDIÇÃO */
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
                                style={[tagsStyles.tagButton, watchedStatus === null && tagsStyles.tagButtonSelected]}
                                onPress={() => setWatchedStatus(null)}
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
                                style={[tagsStyles.tagButton, interestStatus === null && tagsStyles.tagButtonSelected]}
                                onPress={() => setInterestStatus(null)}
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
                                style={[tagsStyles.tagButton, rewatchStatus === null && tagsStyles.tagButtonSelected]}
                                onPress={() => setRewatchStatus(null)}
                            >
                                <Text style={tagsStyles.tagButtonText}>Pular</Text>
                            </Pressable>
                        </View>

                        <Pressable style={tagsStyles.saveButton} onPress={handleSaveTags} disabled={loading}>
                            {loading ? <ActivityIndicator color="black" /> : <Text style={styles.textoBotao}>Salvar Tags</Text>}
                        </Pressable>
                        <Pressable style={tagsStyles.cancelButton} onPress={() => setIsEditMode(false)}>
                            <Text style={tagsStyles.cancelButtonText}>Cancelar</Text>
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
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'transparent',
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
    selectedMovieTitle: {
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
    subSectionTitle: {
        color: '#b0b0b0',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
        alignSelf: 'flex-start',
        width: '100%',
    },
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
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tagButtonSelected: {
        borderColor: '#3E9C9C',
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
    cancelButton: {
        marginTop: 15,
        padding: 10,
    },
    cancelButtonText: {
        color: '#888',
        fontSize: 14,
    },
});
