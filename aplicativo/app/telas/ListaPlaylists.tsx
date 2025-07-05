// aplicativo/app/telas/ListaPlaylists.tsx
import React, { useState, useCallback, useEffect } from 'react'; // Adicionado useEffect
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl, StyleSheet, Image, ActivityIndicator // Adicionado ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles'; //

// Importe as novas classes e serviços
import { Playlist } from '../../src/models/Playlist'; 
import { PlaylistService } from '../../src/services/PlaylistService';

function ListaPlaylists() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]); // NOVO: Estado para playlists filtradas
    const [searchTerm, setSearchTerm] = useState(''); // NOVO: Estado para o termo de pesquisa
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true); // NOVO: Estado de carregamento

    const playlistService = PlaylistService.getInstance(); 

    const fetchPlaylists = useCallback(() => {
        setLoading(true);
        setRefreshing(true);
        const fetched = playlistService.getPlaylists();
        setPlaylists(fetched); // Guarda todas as playlists
        setLoading(false);
        setRefreshing(false);
    }, [playlistService]);

    useFocusEffect(
        useCallback(() => {
            fetchPlaylists();
        }, [fetchPlaylists])
    );

    const onRefresh = useCallback(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    // NOVO: Efeito para filtrar playlists quando o termo de busca ou a lista de playlists muda
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm.trim()) {
                const filtered = playlists.filter(playlist =>
                    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredPlaylists(filtered);
            } else {
                setFilteredPlaylists(playlists); // Se a busca estiver vazia, mostra todas
            }
        }, 300); // Debounce de 300ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, playlists]); // Depende do searchTerm e da lista completa de playlists

    const handleCreateNewPlaylist = () => {
        router.push("/telas/CriarPlaylist");
    };

    const navigateToPlaylistDetails = (playlistId: string) => {
        router.push({
            pathname: `/telas/DetalhesPlaylist`,
            params: { playlistId },
        });
    };

    if (loading && !refreshing && playlists.length === 0 && !searchTerm.trim()) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={listaPlaylistsStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={listaPlaylistsStyles.headerTitle}>Minhas Playlists</Text>
                <AntDesign name="delete" size={24} color="transparent" />{/* Ícone fantasma para centralizar título */}
            </View>

            {/* NOVO: Barra de pesquisa */}
            <View style={listaPlaylistsStyles.searchContainer}>
                <AntDesign name="search1" size={20} color="#7f8c8d" style={listaPlaylistsStyles.searchIcon} />
                <TextInput
                    placeholder="Buscar playlists..."
                    placeholderTextColor="#7f8c8d"
                    style={listaPlaylistsStyles.searchInput}
                    onChangeText={setSearchTerm}
                    value={searchTerm}
                />
            </View>


            <ScrollView
                style={listaPlaylistsStyles.playlistListContainer}
                contentContainerStyle={listaPlaylistsStyles.playlistListContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
            >
                {loading && searchTerm.trim() ? (
                    <ActivityIndicator size="large" color="#3E9C9C" style={{marginTop: 20}} />
                ) : filteredPlaylists.length > 0 ? (
                    filteredPlaylists.map((playlist) => (
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
                    <Text style={listaPlaylistsStyles.noPlaylistsText}>
                        {searchTerm.trim() ? "Nenhuma playlist encontrada com este nome." : "Nenhuma playlist criada ainda."}
                    </Text>
                )}
            </ScrollView>

            {/* NOVO: Botão flutuante para criar nova playlist */}
            <Pressable 
                style={listaPlaylistsStyles.createPlaylistFloatingButton} 
                onPress={handleCreateNewPlaylist}
            >
                <AntDesign name="plus" size={24} color="#eaeaea" style={{marginRight: 8}} />
                <Text style={listaPlaylistsStyles.createPlaylistButtonText}>Nova Playlist</Text>
            </Pressable>
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
    // NOVO: Estilos da barra de pesquisa
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 25,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        marginBottom: 20, // Espaçamento abaixo da barra de pesquisa
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    searchIcon: {
        marginRight: 10,
        color: '#7f8c8d',
    },
    searchInput: {
        flex: 1,
        color: '#eaeaea',
        fontSize: 16,
        height: 40,
    },
    // REMOVIDO: Estilos do addPlaylistContainer e addButton
    /*
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
    */
    playlistListContainer: {
        flex: 1,
        width: '100%',
    },
    playlistListContent: {
        padding: 20,
        paddingBottom: 100, // Espaço para o botão flutuante
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
    // NOVO: Estilos do botão flutuante "Nova Playlist"
    createPlaylistFloatingButton: {
        position: 'absolute',
        bottom: 90, // Acima da tab bar
        left: 20, // Canto inferior esquerdo
        backgroundColor: '#3E9C9C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        zIndex: 10,
    },
    createPlaylistButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});