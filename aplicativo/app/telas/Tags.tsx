// aplicativo/app/telas/Tags.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { Movie } from '../../src/models/Movie';
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../../src/models/Tag';
import { MovieService } from '../../src/services/MovieService';
import { TagService } from '../../src/services/TagService';

function TagsScreen() {
    const router = useRouter();
    const { movieId } = useLocalSearchParams<{ movieId: string }>();
    
    const [movie, setMovie] = useState<Movie | null>(null);
    const [currentTag, setCurrentTag] = useState<Tag | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Estados temporários para a edição
    const [watched, setWatched] = useState<WatchedStatus | null>(null);
    const [interest, setInterest] = useState<InterestStatus | null>(null);
    const [rewatch, setRewatch] = useState<RewatchStatus | null>(null);

    const movieService = MovieService.getInstance();
    const tagService = TagService.getInstance();

    const loadMovieAndTags = useCallback(async () => {
        if (!movieId) return;
        setLoading(true);
        try {
            const fetchedMovie = await movieService.getMovieById(movieId);
            if (!fetchedMovie) {
                Alert.alert("Erro", "Filme não encontrado.");
                router.back();
                return;
            }
            setMovie(fetchedMovie);
            
            // CORREÇÃO: Usando getTagForMovie
            const fetchedTag = await tagService.getTagForMovie(movieId);
            setCurrentTag(fetchedTag);

            // Prepara o formulário de edição com os dados atuais
            setWatched(fetchedTag?.watched || null);
            setInterest(fetchedTag?.interest || null);
            setRewatch(fetchedTag?.rewatch || null);
        } catch (error) {
            console.error("Erro ao carregar dados na tela de Tags:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados das tags.");
        } finally {
            setLoading(false);
        }
    }, [movieId]);

    useFocusEffect(useCallback(() => {
        loadMovieAndTags();
    }, [loadMovieAndTags]));

    const handleSave = async () => {
        if (!movie) return;
        setLoading(true);
        const tagData = { movieId: movie.id, watched, interest, rewatch };

        try {
            if (currentTag) {
                await tagService.updateTag(currentTag.id, tagData);
            } else {
                // CORREÇÃO: Usando createTag com o objeto de dados correto
                await tagService.createTag(tagData);
            }
            Alert.alert("Sucesso", "Tags salvas!");
            setIsEditMode(false);
            await loadMovieAndTags();
        } catch (error) {
            console.error("Erro ao salvar tags:", error);
            Alert.alert("Erro", "Não foi possível salvar as tags.");
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!currentTag || !movie) return;
        Alert.alert("Excluir Tags", `Tem certeza que deseja remover as tags de "${movie.title}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                onPress: async () => {
                    setLoading(true);
                    try {
                        await tagService.deleteTag(currentTag.id);
                        Alert.alert("Sucesso", "Tags removidas.");
                        setCurrentTag(null);
                        setWatched(null); setInterest(null); setRewatch(null);
                        setIsEditMode(false);
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível remover as tags.");
                    } finally {
                        setLoading(false);
                    }
                },
                style: "destructive",
            },
        ]);
    };
    
    if (loading || !movie) {
        return <View style={[styles.container, {justifyContent: 'center'}]}><ActivityIndicator size="large" color="#3E9C9C" /></View>;
    }
    
    const renderTagButton = (label: string, value: any, state: any, setState: Function) => (
        <Pressable
            key={value}
            style={[tagsStyles.tagButton, state === value && tagsStyles.tagButtonSelected]}
            onPress={() => setState(state === value ? null : value)}
        >
            <Text style={tagsStyles.tagButtonText}>{label}</Text>
        </Pressable>
    );

    const renderTagSection = (title: string, options: { label: string, value: any }[], state: any, setState: Function) => (
        <View style={{width: '100%', alignItems: 'center'}}>
            <Text style={tagsStyles.subSectionTitle}>{title}</Text>
            <View style={tagsStyles.tagOptionsContainer}>
                {options.map(opt => renderTagButton(opt.label, opt.value, state, setState))}
            </View>
        </View>
    );
    
    return (
        <View style={styles.container}>
            <View style={tagsStyles.header}>
                <Pressable onPress={() => router.back()}><AntDesign name="arrowleft" size={24} color="#eaeaea" /></Pressable>
                <Text style={tagsStyles.headerTitle}>Gerenciar Tags</Text>
                <View style={{width: 24}} />
            </View>

            <ScrollView contentContainerStyle={tagsStyles.scrollViewContent}>
                <Text style={tagsStyles.movieTitle}>{movie.title}</Text>

                {isEditMode ? (
                    <View style={tagsStyles.formContainer}>
                        {renderTagSection("Você assistiu o filme?", [
                            { label: "Assisti", value: "assistido" },
                            { label: "Assisti há tempos", value: "assistido_old" },
                            { label: "Saí no meio", value: "drop" },
                            { label: "Não assisti", value: "nao_assistido" },
                        ], watched, setWatched)}
                        
                        {renderTagSection("Tem interesse em filmes assim?", [
                            { label: "Tenho interesse", value: "sim" },
                            { label: "Não tenho interesse", value: "nao" },
                        ], interest, setInterest)}

                        {renderTagSection("Você voltaria a assistir?", [
                            { label: "Sim", value: "sim" },
                            { label: "Não", value: "nao" },
                        ], rewatch, setRewatch)}

                        <Pressable style={tagsStyles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="black" /> : <Text style={styles.textoBotao}>Salvar Tags</Text>}
                        </Pressable>
                        <Pressable style={tagsStyles.cancelButton} onPress={() => setIsEditMode(false)}>
                            <Text style={tagsStyles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={tagsStyles.viewContainer}>
                        <Text style={tagsStyles.sectionTitle}>Suas Tags Atuais:</Text>
                        {currentTag ? (
                            <View style={tagsStyles.tagsDisplay}>
                                <Text style={tagsStyles.tagText}>Visualização: <Text style={tagsStyles.tagValue}>{currentTag.watched || "Não definido"}</Text></Text>
                                <Text style={tagsStyles.tagText}>Interesse: <Text style={tagsStyles.tagValue}>{currentTag.interest || "Não definido"}</Text></Text>
                                <Text style={tagsStyles.tagText}>Reassistir: <Text style={tagsStyles.tagValue}>{currentTag.rewatch || "Não definido"}</Text></Text>
                            </View>
                        ) : (
                            <Text style={tagsStyles.tagValue}>Nenhuma tag definida para este filme.</Text>
                        )}
                        <Pressable style={tagsStyles.editButton} onPress={() => setIsEditMode(true)}>
                            <Text style={styles.textoBotao}>{currentTag ? 'Editar Tags' : 'Adicionar Tags'}</Text>
                        </Pressable>
                        {currentTag && (
                             <Pressable style={tagsStyles.deleteButton} onPress={handleDelete}>
                                <AntDesign name="delete" size={16} color="#FF6347" />
                                <Text style={tagsStyles.deleteButtonText}>Remover Tags</Text>
                            </Pressable>
                        )}
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
        backgroundColor: 'transparent', // REMOVIDO o background escuro
        borderBottomWidth: 0, // Removido o borderBottomWidth se desejar um visual mais limpo
        // borderBottomColor: '#2E3D50' // Comente ou remova esta linha se borderBottomWidth for 0
    },
    headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold" },
    scrollViewContent: { padding: 20, alignItems: 'center', paddingBottom: 50 },
    movieTitle: { color: '#3E9C9C', fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
    sectionTitle: { color: '#eaeaea', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    subSectionTitle: { color: '#b0b0b0', fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    viewContainer: { width: '100%', alignItems: 'center' },
    tagsDisplay: { backgroundColor: '#2E3D50', borderRadius: 8, padding: 20, width: '100%', marginBottom: 30 },
    tagText: { color: '#b0b0b0', fontSize: 16, marginBottom: 10 },
    tagValue: { color: '#eaeaea', fontWeight: 'bold' },
    editButton: { backgroundColor: '#3E9C9C', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center' },
    deleteButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    deleteButtonText: { color: '#FF6347', marginLeft: 8, fontSize: 14, fontWeight: '600' },
    formContainer: { width: '100%', alignItems: 'center' },
    tagOptionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
    tagButton: { backgroundColor: '#4A6B8A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, margin: 5, borderWidth: 2, borderColor: 'transparent' },
    tagButtonSelected: { borderColor: '#3E9C9C' },
    tagButtonText: { color: '#eaeaea', fontWeight: 'bold', fontSize: 14 },
    saveButton: { backgroundColor: '#3E9C9C', paddingVertical: 15, borderRadius: 30, marginTop: 30, width: '80%', alignItems: 'center' },
    cancelButton: { marginTop: 15, padding: 10 },
    cancelButtonText: { color: '#888', fontSize: 14 },
});
