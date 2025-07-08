// aplicativo/app/telas/ListaPlaylists.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';

import { styles } from '../styles';
import { Playlist } from '../../src/models/Playlist';
import { PlaylistService } from '../../src/services/PlaylistService';

function ListaPlaylistsScreen() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    const playlistService = PlaylistService.getInstance();

    const fetchPlaylists = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedPlaylists = await playlistService.getAllUserPlaylists();
            setPlaylists(fetchedPlaylists);
        } catch (error) {
            console.error("Erro ao carregar playlists:", error);
            Alert.alert("Erro", "Não foi possível carregar suas playlists.");
        } finally {
            setLoading(false);
        }
    }, [playlistService]);

    useFocusEffect(
        useCallback(() => {
            fetchPlaylists();
        }, [fetchPlaylists])
    );

    const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
        Alert.alert(
            "Excluir Playlist",
            `Tem certeza que deseja excluir a playlist "${playlistName}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await playlistService.deletePlaylist(playlistId);
                            Alert.alert("Sucesso", "Playlist excluída com sucesso!");
                            fetchPlaylists(); // Recarrega a lista
                        } catch (error) {
                            console.error("Erro ao excluir playlist:", error);
                            Alert.alert("Erro", "Não foi possível excluir a playlist.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };
    
    const renderPlaylistItem = ({ item }: { item: Playlist }) => (
        // Cada item agora é um "card" com sombra e borda
        <View style={listStyles.playlistCard}>
            <Pressable
                style={listStyles.playlistItem}
                onPress={() => router.push({ pathname: '/telas/DetalhesPlaylist', params: { playlistId: item.id } })}
                android_ripple={{ color: '#4A6B8A' }} // Efeito de clique para Android
            >
                <View style={listStyles.playlistInfo}>
                    <Text style={listStyles.playlistName}>{item.name}</Text>
                    {item.description ? (
                        <Text style={listStyles.playlistDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : (
                        <Text style={listStyles.playlistDescriptionItalic}>Sem descrição</Text>
                    )}
                    <Text style={listStyles.movieCount}>
                        {item.movieIds.length} filme(s)
                    </Text>
                </View>
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(item.id, item.name);
                    }}
                    style={listStyles.deleteButton}
                >
                    <Feather name="trash-2" size={22} color="#FF6347" />
                </Pressable>
            </Pressable>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={listStyles.header}>
                <Pressable onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={listStyles.headerTitle}>Minhas Playlists</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={listStyles.listContent}
                ListEmptyComponent={
                    <View style={listStyles.noPlaylistsContainer}>
                        <Text style={listStyles.noPlaylistsText}>Você ainda não tem nenhuma playlist.</Text>
                        <Text style={listStyles.noPlaylistsSubText}>Crie uma no botão flutuante!</Text>
                    </View>
                }
            />

            <Pressable
                style={listStyles.fab}
                onPress={() => router.push('/telas/CriarPlaylist')}
            >
                <AntDesign name="plus" size={28} color="black" />
            </Pressable>
        </View>
    );
}

export default ListaPlaylistsScreen;

const listStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#1A2B3E",
    },
    headerTitle: {
        color: "#eaeaea",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 120,
    },
    playlistCard: { // NOVO ESTILO: O contêiner do card
        backgroundColor: '#2E3D50',
        borderRadius: 12,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowRadius: 4,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    playlistItem: { // Conteúdo clicável dentro do card
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    playlistInfo: {
        flex: 1,
        marginRight: 10,
    },
    playlistName: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    playlistDescription: {
        color: '#b0b0b0',
        fontSize: 14,
        marginBottom: 10,
    },
    playlistDescriptionItalic: { // Estilo para "Sem descrição"
        color: '#888',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    movieCount: {
        color: '#888',
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    noPlaylistsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 150,
    },
    noPlaylistsText: { color: '#b0b0b0', fontSize: 18, textAlign: 'center' },
    noPlaylistsSubText: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 10 },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 25,
        bottom: 25,
        backgroundColor: '#3E9C9C',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
});