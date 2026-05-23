// aplicativo/app/telas/ListaGrupos.tsx
// Tela de listagem de grupos do usuário com FAB para criar novos grupos
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { Group } from '../../src/models/Group';
import { GroupService } from '../../src/services/GroupService';
import { getAuth } from 'firebase/auth';
import { app } from '../../src/config/firebaseConfig';

function ListaGruposScreen() {
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const groupService = GroupService.getInstance();

    // Obtém o ID do usuário atual
    const getCurrentUserId = (): string | null => {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    };

    // Carrega todos os grupos do usuário
    const fetchGroups = useCallback(async () => {
        setRefreshing(true);
        try {
            const fetchedGroups = await groupService.getAllUserGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Erro ao carregar grupos:", error);
            Alert.alert("Erro", "Não foi possível carregar seus grupos.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [groupService]);

    // Recarrega ao focar na tela
    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [fetchGroups])
    );

    // Função de pull-to-refresh
    const onRefresh = useCallback(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Navega para a tela de detalhes do grupo
    const navigateToGroupDetails = (groupId: string) => {
        router.push({ pathname: '/telas/DetalhesGrupo', params: { groupId } });
    };

    // Exclui um grupo (somente para o dono) com confirmação
    const handleDeleteGroup = async (groupId: string, groupName: string) => {
        Alert.alert(
            "Excluir Grupo",
            `Tem certeza que deseja excluir o grupo "${groupName}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await groupService.deleteGroup(groupId);
                            Alert.alert("Sucesso", "Grupo excluído com sucesso!");
                            fetchGroups(); // Recarrega a lista
                        } catch (error) {
                            console.error("Erro ao excluir grupo:", error);
                            Alert.alert("Erro", "Não foi possível excluir o grupo.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // Renderiza cada card de grupo na lista
    const renderGroupItem = ({ item }: { item: Group }) => {
        const currentUserId = getCurrentUserId();
        const isOwner = item.ownerId === currentUserId;

        return (
            <View style={listaStyles.groupCard}>
                <Pressable
                    style={listaStyles.groupItem}
                    onPress={() => navigateToGroupDetails(item.id)}
                    android_ripple={{ color: '#4A6B8A' }}
                >
                    {/* Ícone do grupo */}
                    <View style={listaStyles.groupIconContainer}>
                        <Ionicons name="people" size={28} color="#3E9C9C" />
                    </View>

                    {/* Informações do grupo */}
                    <View style={listaStyles.groupInfo}>
                        <View style={listaStyles.groupNameRow}>
                            <Text style={listaStyles.groupName} numberOfLines={1}>{item.name}</Text>
                            {/* Badge de dono */}
                            {isOwner && (
                                <View style={listaStyles.ownerBadge}>
                                    <Text style={listaStyles.ownerBadgeText}>Dono</Text>
                                </View>
                            )}
                        </View>

                        {item.description ? (
                            <Text style={listaStyles.groupDescription} numberOfLines={2}>{item.description}</Text>
                        ) : (
                            <Text style={listaStyles.groupDescriptionItalic}>Sem descrição</Text>
                        )}

                        {/* Contadores de membros e playlists */}
                        <View style={listaStyles.statsRow}>
                            <View style={listaStyles.statItem}>
                                <Ionicons name="person" size={14} color="#B0C4DE" />
                                <Text style={listaStyles.statText}>{item.memberIds.length}</Text>
                            </View>
                            <View style={listaStyles.statItem}>
                                <MaterialIcons name="playlist-play" size={18} color="#B0C4DE" />
                                <Text style={listaStyles.statText}>{item.sharedPlaylistIds.length}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botão de excluir (somente para o dono) */}
                    {isOwner && (
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(item.id, item.name);
                            }}
                            style={listaStyles.deleteButton}
                        >
                            <Feather name="trash-2" size={20} color="#FF6347" />
                        </Pressable>
                    )}
                </Pressable>
            </View>
        );
    };

    // Tela de carregamento
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header com botão voltar e título */}
            <View style={listaStyles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                </Pressable>
                <Text style={listaStyles.headerTitle}>Meus Grupos</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* Lista de grupos */}
            <FlatList
                data={groups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={listaStyles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
                }
                ListEmptyComponent={
                    <View style={listaStyles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#4A6B8A" />
                        <Text style={listaStyles.emptyText}>Nenhum grupo encontrado</Text>
                        <Text style={listaStyles.emptySubText}>
                            Crie um grupo para compartilhar playlists com seus amigos!
                        </Text>
                    </View>
                }
            />

            {/* Botão FAB para criar novo grupo */}
            <Pressable
                style={listaStyles.fab}
                onPress={() => router.push('/telas/CriarGrupo')}
            >
                <AntDesign name="plus" size={28} color="#FFFFFF" />
            </Pressable>
        </View>
    );
}

export default ListaGruposScreen;

const listaStyles = StyleSheet.create({
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
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 120,
    },
    groupCard: {
        backgroundColor: '#1A2B3E',
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
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    groupIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2E3D50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    groupInfo: {
        flex: 1,
        marginRight: 10,
    },
    groupNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    groupName: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
        flex: 1,
    },
    ownerBadge: {
        backgroundColor: '#3E9C9C',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    ownerBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    groupDescription: {
        color: '#B0C4DE',
        fontSize: 13,
        marginBottom: 6,
    },
    groupDescriptionItalic: {
        color: '#888',
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        color: '#B0C4DE',
        fontSize: 12,
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 120,
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
    },
    emptySubText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
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
        shadowColor: '#3E9C9C',
        shadowRadius: 8,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
    },
});
