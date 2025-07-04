// aplicativo/app/telas/ListaPlaylists.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl, StyleSheet, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';

// Importe as novas classes e serviços
import { Playlist } from '../../src/models/Playlist';
import { PlaylistService } from '../../src/services/PlaylistService';

function ListaPlaylists() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const playlistService = PlaylistService.getInstance(); // Obtenha a instância do PlaylistService

    const fetchPlaylists = useCallback(() => {
        setRefreshing(true);
        const fetchedPlaylists = playlistService.getPlaylists();
        setPlaylists(fetchedPlaylists);
        setRefreshing(false);
    }, [playlistService]); // Adicione playlistService como dependência

    useFocusEffect(
        useCallback(() => {
            fetchPlaylists();
        }, [fetchPlaylists])
    );

    const onRefresh = useCallback(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const handleAddPlaylist = () => {
        if (newPlaylistName.trim()) {
            playlistService.addPlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            fetchPlaylists(); // Recarrega a lista após adicionar
        }
    };

    const navigateToPlaylistDetails = (playlistId: string) => {
        router.push({
            pathname: `/telas/DetalhesPlaylist`,
            params: { playlistId },
        });
    };

    return (
        <View style={styles.container}>
            <View style={listaPlaylistsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={listaPlaylistsStyles.headerTitle}>Minhas Playlists</Text>
                <AntDesign name="delete" size={24} color="transparent" />{/* Ícone fantasma para centralizar título */}
            </View>

            <View style={listaPlaylistsStyles.addPlaylistContainer}>
                <TextInput
                    placeholder="Nome da nova playlist"
                    placeholderTextColor="grey"
                    style={[styles.input, { flex: 1 }]}
                    onChangeText={setNewPlaylistName}
                    value={newPlaylistName}
                />
                <Pressable style={listaPlaylistsStyles.addButton} onPress={handleAddPlaylist}>
                    <AntDesign name="pluscircleo" size={24} color="#eaeaea" />
                </Pressable>
            </View>

            <ScrollView
                style={listaPlaylistsStyles.playlistListContainer}
                contentContainerStyle={listaPlaylistsStyles.playlistListContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            >
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <Pressable key={playlist.id} style={listaPlaylistsStyles.playlistItem} onPress={() => navigateToPlaylistDetails(playlist.id)}>
                            <Image
                                source={playlist.coverImageUrl ? { uri: playlist.coverImageUrl } : require('../../assets/images/filmeia-logo2.png')}
                                style={listaPlaylistsStyles.playlistCover}
                            />
                            <Text style={listaPlaylistsStyles.playlistName} numberOfLines={1}>{playlist.name}</Text>
                            <Text style={listaPlaylistsStyles.playlistMovieCount}>{playlist.movieIds.length} filmes</Text>
                        </Pressable>
                    ))
                ) : (
                    <Text style={listaPlaylistsStyles.noPlaylistsText}>Nenhuma playlist criada ainda.</Text>
                )}
            </ScrollView>
        </View>
    );
}

export default ListaPlaylists;

const listaPlaylistsStyles = StyleSheet.create({
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
    addPlaylistContainer: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#4A6B8A',
        alignItems: 'center',
    },
    addButton: {
        marginLeft: 10,
        padding: 8,
        backgroundColor: '#3E9C9C',
        borderRadius: 25,
    },
    playlistListContainer: {
        flex: 1,
        width: '100%',
    },
    playlistListContent: {
        padding: 20,
        alignItems: 'center',
    },
    playlistItem: {
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    playlistCover: {
        width: 100,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    playlistName: {
        color: '#eaeaea',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    playlistMovieCount: {
        color: '#b0b0b0',
        fontSize: 14,
    },
    noPlaylistsText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
    },
});