// aplicativo/app/telas/ListaPlaylists.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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

    const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
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

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
                <Text style={{ color: '#eaeaea', marginTop: 10 }}>Carregando playlists...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={listStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={listStyles.headerTitle}>Minhas Playlists</Text>
                <Pressable onPress={() => router.push('/telas/CriarPlaylist')}>
                    <AntDesign name="pluscircleo" size={24} color="#3E9C9C" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={listStyles.scrollViewContent}>
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <Pressable
                            key={playlist.id}
                            style={listStyles.playlistItem}
                            onPress={() => router.push(`/telas/DetalhesPlaylist?playlistId=${playlist.id}`)}
                        >
                            <View style={listStyles.playlistInfo}>
                                <Text style={listStyles.playlistName}>{playlist.name}</Text>
                                {playlist.description && (
                                    <Text style={listStyles.playlistDescription} numberOfLines={2}>
                                        {playlist.description}
                                    </Text>
                                )}
                                <Text style={listStyles.movieCount}>
                                    {playlist.movieIds.length} filme(s)
                                </Text>
                            </View>
                            <Pressable 
                                onPress={() => handleDeletePlaylist(playlist.id, playlist.name)}
                                style={listStyles.deleteButton}
                            >
                                <Feather name="trash-2" size={20} color="#FF6347" />
                            </Pressable>
                        </Pressable>
                    ))
                ) : (
                    <View style={listStyles.noPlaylistsContainer}>
                        <Text style={listStyles.noPlaylistsText}>Você ainda não tem nenhuma playlist.</Text>
                        <Text style={listStyles.noPlaylistsText}>Crie uma para organizar seus filmes!</Text>
                    </View>
                )}
            </ScrollView>
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
    playlistItem: {
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A6B8A',
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
        marginBottom: 5,
    },
    movieCount: {
        color: '#888',
        fontSize: 12,
    },
    deleteButton: {
        padding: 5,
    },
    noPlaylistsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    noPlaylistsText: {
        color: '#b0b0b0',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
});