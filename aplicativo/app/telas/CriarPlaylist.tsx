// aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { PlaylistService } from '../../src/services/PlaylistService'; // Importa o PlaylistService

function CriarPlaylistScreen() {
    const router = useRouter();
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const playlistService = PlaylistService.getInstance();

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim()) {
            Alert.alert("Erro", "O nome da playlist não pode ser vazio.");
            return;
        }

        setLoading(true);
        try {
            // Chama o serviço para criar a playlist no Firestore
            await playlistService.createPlaylist(playlistName.trim(), playlistDescription.trim());
            Alert.alert("Sucesso", "Playlist criada com sucesso!");
            router.back(); // Volta para a tela anterior (Lista de Playlists)
        } catch (error) {
            console.error("Erro ao criar playlist:", error);
            Alert.alert("Erro", "Não foi possível criar a playlist. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={playlistStyles.header}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={playlistStyles.headerTitle}>Criar Nova Playlist</Text>
            </View>

            <View style={playlistStyles.formContainer}>
                <Text style={playlistStyles.label}>Nome da Playlist:</Text>
                <TextInput
                    style={[styles.input, playlistStyles.inputField]}
                    placeholder="Minha Playlist Favorita"
                    placeholderTextColor={"grey"}
                    value={playlistName}
                    onChangeText={setPlaylistName}
                />

                <Text style={playlistStyles.label}>Descrição (Opcional):</Text>
                <TextInput
                    style={[styles.input, playlistStyles.inputField, playlistStyles.textArea]}
                    placeholder="Filmes que eu amo e assistiria mil vezes!"
                    placeholderTextColor={"grey"}
                    multiline
                    numberOfLines={4}
                    value={playlistDescription}
                    onChangeText={setPlaylistDescription}
                />

                <Pressable
                    style={playlistStyles.createButton}
                    onPress={handleCreatePlaylist}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Text style={playlistStyles.createButtonText}>Criar Playlist</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

export default CriarPlaylistScreen;

const playlistStyles = StyleSheet.create({
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
    formContainer: {
        padding: 20,
        flex: 1,
    },
    label: {
        color: '#eaeaea',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputField: {
        marginBottom: 20,
        backgroundColor: '#1A2B3E',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        color: '#eaeaea',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingVertical: 10,
    },
    createButton: {
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    createButtonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
});