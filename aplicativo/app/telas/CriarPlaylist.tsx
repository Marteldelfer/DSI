// aplicativo/app/telas/CriarPlaylist.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { PlaylistService } from '../../src/services/PlaylistService';

function CriarPlaylistScreen() {
    const router = useRouter();
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const playlistService = PlaylistService.getInstance();

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim()) {
            Alert.alert("Atenção", "O nome da playlist é obrigatório.");
            return;
        }

        setLoading(true);
        try {
            // CORREÇÃO: Passando um array vazio para movieIds
            await playlistService.createPlaylist(playlistName.trim(), playlistDescription.trim(), []);
            Alert.alert("Sucesso", "Playlist criada com sucesso!");
            router.back();
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
                <Pressable onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color="#eaeaea" />
                </Pressable>
                <Text style={playlistStyles.headerTitle}>Criar Nova Playlist</Text>
            </View>

            <ScrollView style={playlistStyles.formContainer}>
                <Text style={playlistStyles.label}>Nome da Playlist</Text>
                <TextInput
                    style={playlistStyles.inputField}
                    placeholder="Ex: Clássicos dos Anos 80"
                    placeholderTextColor="grey"
                    value={playlistName}
                    onChangeText={setPlaylistName}
                />

                <Text style={playlistStyles.label}>Descrição (Opcional)</Text>
                <TextInput
                    style={[playlistStyles.inputField, playlistStyles.textArea]}
                    placeholder="Uma seleção dos melhores filmes da década."
                    placeholderTextColor="grey"
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
            </ScrollView>
        </View>
    );
}

export default CriarPlaylistScreen;

const playlistStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'transparent', // REMOVIDO o background escuro
    },
    headerTitle: {
        color: "#eaeaea",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 20,
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
        fontSize: 16,
        marginBottom: 25,
        backgroundColor: '#2E3D50',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        minHeight: 50,
        color: '#eaeaea',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
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
