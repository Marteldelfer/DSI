// aplicativo/app/(tabs)/Diario.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { DiarioCinema } from '../../src/models/DiarioCinema';
import { DiarioCinemaService } from '../../src/services/DiarioCinemaService';

function DiarioScreen() {
    const router = useRouter();
    const [entradas, setEntradas] = useState<DiarioCinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const diarioService = DiarioCinemaService.getInstance();

    // Busca todas as entradas do diário
    const fetchEntradas = useCallback(async () => {
        try {
            const fetchedEntradas = await diarioService.getAllEntradas();
            setEntradas(fetchedEntradas);
        } catch (error) {
            console.error("Erro ao carregar entradas do diário:", error);
            Alert.alert("Erro", "Não foi possível carregar seu diário.");
        }
    }, []);

    // Carrega ao focar na tela
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchEntradas().finally(() => setLoading(false));
        }, [fetchEntradas])
    );

    // Pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchEntradas();
        setRefreshing(false);
    }, [fetchEntradas]);

    // Confirmação e exclusão de uma entrada
    const handleExcluir = (entrada: DiarioCinema) => {
        Alert.alert(
            "Excluir Registro",
            `Deseja realmente excluir o registro de "${entrada.cinemaName}"?\n\nEsta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await diarioService.deleteEntrada(entrada.id);
                            setEntradas(prev => prev.filter(e => e.id !== entrada.id));
                        } catch (error) {
                            console.error("Erro ao excluir entrada:", error);
                            Alert.alert("Erro", "Não foi possível excluir o registro.");
                        }
                    },
                },
            ]
        );
    };

    // Renderiza cada card do diário
    const renderEntradaItem = ({ item }: { item: DiarioCinema }) => (
        <View style={diarioStyles.card}>
            {/* Linha superior: data + botão excluir */}
            <View style={diarioStyles.cardHeader}>
                <View style={diarioStyles.dateRow}>
                    <MaterialCommunityIcons name="calendar-month" size={18} color="#3E9C9C" />
                    <Text style={diarioStyles.dateText}>{item.data}</Text>
                </View>
                <Pressable
                    style={diarioStyles.deleteButton}
                    onPress={() => handleExcluir(item)}
                    hitSlop={8}
                >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    <Text style={diarioStyles.deleteButtonText}>Excluir</Text>
                </Pressable>
            </View>

            {/* Nome do cinema */}
            <View style={diarioStyles.cinemaRow}>
                <MaterialCommunityIcons name="filmstrip" size={18} color="#3E9C9C" />
                <Text style={diarioStyles.cinemaName} numberOfLines={1}>
                    {item.cinemaName}
                </Text>
            </View>

            {/* Título do filme */}
            {item.movieTitle ? (
                <View style={diarioStyles.movieRow}>
                    <Text style={diarioStyles.movieLabel}>Filme: </Text>
                    <Text style={diarioStyles.movieTitle} numberOfLines={1}>
                        {item.movieTitle}
                    </Text>
                </View>
            ) : null}

            {/* Galeria horizontal de fotos */}
            {item.fotos && item.fotos.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={diarioStyles.photoGallery}
                    contentContainerStyle={diarioStyles.photoGalleryContent}
                >
                    {item.fotos.map((fotoUrl, index) => (
                        <Image
                            key={`${item.id}-foto-${index}`}
                            source={{ uri: fotoUrl }}
                            style={diarioStyles.photoThumbnail}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
            ) : null}

            {/* Observações */}
            {item.observacoes ? (
                <Text style={diarioStyles.observacoes} numberOfLines={2}>
                    "{item.observacoes}"
                </Text>
            ) : null}
        </View>
    );

    // Estado de carregamento inicial
    if (loading) {
        return (
            <View style={[styles.container, diarioStyles.centerContent]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
                <Text style={diarioStyles.loadingText}>Carregando diário...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Cabeçalho */}
            <View style={diarioStyles.header}>
                <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#3E9C9C" />
                <Text style={diarioStyles.headerTitle}>Meu Diário</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Lista de entradas */}
            <FlatList
                data={entradas}
                renderItem={renderEntradaItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={diarioStyles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3E9C9C']}
                        tintColor="#3E9C9C"
                        progressBackgroundColor="#1A2B3E"
                    />
                }
                ListEmptyComponent={
                    <View style={diarioStyles.emptyContainer}>
                        <MaterialCommunityIcons name="book-open-blank-variant" size={70} color="#4A6B8A" />
                        <Text style={diarioStyles.emptyText}>Nenhum registro ainda</Text>
                        <Text style={diarioStyles.emptySubText}>
                            Toque no botão + para registrar sua primeira experiência no cinema!
                        </Text>
                    </View>
                }
            />

            {/* FAB — Criar novo registro */}
            <Pressable
                style={diarioStyles.fab}
                onPress={() => router.push('/telas/CriarDiario')}
            >
                <AntDesign name="plus" size={28} color="#000000" />
            </Pressable>
        </View>
    );
}

export default DiarioScreen;

const diarioStyles = StyleSheet.create({
    // Centralizar conteúdo (loading)
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#B0C4DE',
        fontSize: 14,
        marginTop: 12,
    },
    // Cabeçalho
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Lista
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 5,
        paddingBottom: 120,
    },
    // Card
    card: {
        backgroundColor: '#1A2B3E',
        borderRadius: 16,
        marginBottom: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#4A6B8A',
        elevation: 4,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
    // Cinema
    cinemaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cinemaName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    // Filme
    movieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 26,
        marginBottom: 10,
    },
    movieLabel: {
        color: '#B0C4DE',
        fontSize: 14,
    },
    movieTitle: {
        color: '#3E9C9C',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    // Galeria de fotos
    photoGallery: {
        marginBottom: 10,
    },
    photoGalleryContent: {
        paddingVertical: 4,
        gap: 8,
    },
    photoThumbnail: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#2E3D50',
    },
    // Observações
    observacoes: {
        color: '#B0C4DE',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 19,
        marginTop: 2,
    },
    // Estado vazio
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubText: {
        color: '#4A6B8A',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    // FAB
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
