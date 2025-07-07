// aplicativo/app/telas/Tags.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { Tag } from '../../src/models/Tag'; // Importa o modelo Tag
import { TagService } from '../../src/services/TagService'; // Importa o TagService
import { Movie } from '../../src/models/Movie'; // Importa o modelo Movie
import { MovieService } from '../../src/services/MovieService'; // Importa o MovieService

// Tipos de tags pré-definidos com seus rótulos para exibição
const predefinedTagTypes = [
    { type: 'watched_on', label: 'Assisti em' },
    { type: 'interest_level', label: 'Nível de Interesse' },
    { type: 're_watch', label: 'Reassistiria?' },
    { type: 'genre_mood', label: 'Gênero/Humor' },
];

function TagsScreen() {
    const router = useRouter();
    const { movieId } = useLocalSearchParams(); // ID do filme para o qual as tags serão gerenciadas

    const [movie, setMovie] = useState<Movie | null>(null); // Estado para o filme
    const [tags, setTags] = useState<Tag[]>([]); // Estado para as tags do filme
    const [loading, setLoading] = useState(true); // Estado de carregamento
    const [selectedTagType, setSelectedTagType] = useState<string | null>(null); // Tipo de tag selecionado para adicionar/editar
    const [tagInputValue, setTagInputValue] = useState(''); // Valor do input da tag

    const tagService = TagService.getInstance();
    const movieService = MovieService.getInstance();

    const fetchMovieAndTags = useCallback(async () => {
        setLoading(true);
        if (movieId && typeof movieId === 'string') {
            try {
                // Busca os detalhes do filme
                const fetchedMovie = await movieService.getMovieById(movieId); // USANDO AWAIT
                setMovie(fetchedMovie || null);

                // Busca as tags para este filme
                const fetchedTags = await tagService.getTagsByMovieId(movieId); // USANDO AWAIT
                setTags(fetchedTags);

            } catch (error) {
                console.error("Erro ao carregar filme e tags:", error);
                Alert.alert("Erro", "Não foi possível carregar as informações do filme e suas tags.");
                router.back();
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert("Erro", "ID do filme não fornecido.");
            router.back();
            setLoading(false);
        }
    }, [movieId, movieService, tagService]);

    useFocusEffect(
        useCallback(() => {
            fetchMovieAndTags();
            // Resetar o estado da seleção de tag e input ao focar na tela
            setSelectedTagType(null);
            setTagInputValue('');
        }, [fetchMovieAndTags])
    );

    const handleSelectTagType = (type: string) => {
        setSelectedTagType(type);
        // Preenche o input se já existir uma tag desse tipo para o filme
        const existingTag = tags.find(tag => tag.type === type);
        setTagInputValue(existingTag ? existingTag.value : '');
    };

    const handleSaveTag = async () => {
        if (!selectedTagType || !tagInputValue.trim() || !movieId) {
            Alert.alert("Erro", "Por favor, selecione um tipo de tag e insira um valor.");
            return;
        }

        try {
            // createTag já lida com a lógica de upsert (cria ou atualiza)
            await tagService.createTag(movieId as string, selectedTagType, tagInputValue.trim()); // USANDO AWAIT
            Alert.alert("Sucesso", "Tag salva com sucesso!");
            setTagInputValue(''); // Limpa o input
            setSelectedTagType(null); // Reseta a seleção
            fetchMovieAndTags(); // Recarrega as tags para atualizar a lista
        } catch (error) {
            console.error("Erro ao salvar tag:", error);
            Alert.alert("Erro", "Não foi possível salvar a tag.");
        }
    };

    const handleDeleteTag = async (tagDocId: string) => {
        Alert.alert("Excluir Tag", "Tem certeza que deseja excluir esta tag?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Excluir", 
                onPress: async () => { // USANDO ASYNC
                    try {
                        await tagService.deleteTag(tagDocId); // USANDO AWAIT
                        Alert.alert("Sucesso", "Tag excluída com sucesso!");
                        fetchMovieAndTags(); // Recarrega as tags
                    } catch (error) {
                        console.error("Erro ao excluir tag:", error);
                        Alert.alert("Erro", "Não foi possível excluir a tag.");
                    }
                }, 
                style: "destructive" 
            }
        ]);
    };

    if (loading || !movie) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
                <Text style={{ color: '#eaeaea', marginTop: 10 }}>Carregando tags...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={tagsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={tagsStyles.headerTitle} numberOfLines={1}>Tags para "{movie.title}"</Text>
            </View>

            <ScrollView contentContainerStyle={tagsStyles.scrollViewContent}>
                {/* Seção de Tags Existentes */}
                <Text style={tagsStyles.sectionTitle}>Tags Atuais:</Text>
                {tags.length > 0 ? (
                    <View style={tagsStyles.tagsContainer}>
                        {tags.map(tag => (
                            <View key={tag.id} style={tagsStyles.tagItem}>
                                <Text style={tagsStyles.tagText}>
                                    {predefinedTagTypes.find(t => t.type === tag.type)?.label || tag.type}: {tag.value}
                                </Text>
                                <Pressable onPress={() => handleDeleteTag(tag.id)} style={tagsStyles.deleteButton}>
                                    <AntDesign name="closecircle" size={16} color="#FF6347" />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={tagsStyles.noTagsText}>Nenhuma tag adicionada para este filme ainda.</Text>
                )}

                {/* Seção Adicionar/Editar Tag */}
                <Text style={tagsStyles.sectionTitle}>Adicionar/Editar Tag:</Text>
                <View style={tagsStyles.tagTypeSelector}>
                    {predefinedTagTypes.map(tagType => (
                        <Pressable
                            key={tagType.type}
                            style={[
                                tagsStyles.tagTypeButton,
                                selectedTagType === tagType.type && tagsStyles.tagTypeButtonSelected,
                            ]}
                            onPress={() => handleSelectTagType(tagType.type)}
                        >
                            <Text style={tagsStyles.tagTypeButtonText}>
                                {tagType.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {selectedTagType && (
                    <View style={tagsStyles.tagInputContainer}>
                        <TextInput
                            style={[styles.input, tagsStyles.tagInputField]}
                            placeholder={`Valor para '${predefinedTagTypes.find(t => t.type === selectedTagType)?.label || selectedTagType}'...`}
                            placeholderTextColor={"grey"}
                            onChangeText={setTagInputValue}
                            value={tagInputValue}
                        />
                        <Pressable style={tagsStyles.saveTagButton} onPress={handleSaveTag}>
                            <Text style={tagsStyles.saveTagButtonText}>Salvar</Text>
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
        marginLeft: 15,
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    tagItem: {
        backgroundColor: '#4A6B8A',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagText: {
        color: '#eaeaea',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 4,
    },
    noTagsText: {
        color: '#b0b0b0',
        fontSize: 14,
        marginBottom: 20,
    },
    tagTypeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    tagTypeButton: {
        backgroundColor: '#1A2B3E',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    tagTypeButtonSelected: {
        backgroundColor: '#3E9C9C',
        borderColor: '#3E9C9C',
    },
    tagTypeButtonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
        fontSize: 12,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        paddingRight: 5,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    tagInputField: {
        flex: 1,
        height: 50,
        paddingLeft: 15,
        color: '#eaeaea',
        fontSize: 16,
        backgroundColor: 'transparent',
        borderRadius: 25,
    },
    saveTagButton: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    saveTagButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
    },
});