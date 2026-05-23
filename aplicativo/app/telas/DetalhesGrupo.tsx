// aplicativo/app/telas/DetalhesGrupo.tsx
// Tela de detalhes do grupo com gerenciamento de membros e playlists compartilhadas
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { Group } from '../../src/models/Group';
import { Playlist } from '../../src/models/Playlist';
import { GroupService } from '../../src/services/GroupService';
import { PlaylistService } from '../../src/services/PlaylistService';
import { getAuth } from 'firebase/auth';
import { app } from '../../src/config/firebaseConfig';

function DetalhesGrupoScreen() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    // Estados para modal de adicionar membro
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    // Estados para modal de compartilhar playlist
    const [showSharePlaylistModal, setShowSharePlaylistModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);

    const groupService = GroupService.getInstance();
    const playlistService = PlaylistService.getInstance();

    // Obtém o ID do usuário atual para verificar se é dono
    const getCurrentUserId = (): string | null => {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    };

    const isOwner = group ? group.ownerId === getCurrentUserId() : false;

    // Carrega os detalhes do grupo
    const fetchGroupDetails = useCallback(async () => {
        if (!groupId) return;
        setLoading(true);
        try {
            const fetchedGroup = await groupService.getGroupById(groupId);
            setGroup(fetchedGroup || null);

            if (fetchedGroup) {
                setEditedName(fetchedGroup.name);
                setEditedDescription(fetchedGroup.description || '');
            } else {
                Alert.alert("Erro", "Grupo não encontrado.", [{ text: "OK", onPress: () => router.back() }]);
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes do grupo:", error);
            Alert.alert("Erro", "Não foi possível carregar os detalhes do grupo.");
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Recarrega ao focar na tela
    useFocusEffect(useCallback(() => {
        fetchGroupDetails();
    }, [fetchGroupDetails]));

    // Salva as alterações de nome/descrição do grupo
    const handleUpdateGroup = async () => {
        if (!group || !editedName.trim()) {
            Alert.alert("Atenção", "O nome do grupo não pode ser vazio.");
            return;
        }
        try {
            await groupService.updateGroup(group.id, {
                name: editedName.trim(),
                description: editedDescription.trim() || null,
            });
            Alert.alert("Sucesso", "Grupo atualizado!");
            setIsEditing(false);
            fetchGroupDetails();
        } catch (error) {
            console.error("Erro ao atualizar grupo:", error);
            Alert.alert("Erro", "Não foi possível atualizar o grupo.");
        }
    };

    // Exclui o grupo (somente para o dono)
    const handleDeleteGroup = () => {
        if (!group) return;
        Alert.alert(
            "Excluir Grupo",
            `Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await groupService.deleteGroup(group.id);
                            Alert.alert("Sucesso", "Grupo excluído.");
                            router.back();
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

    // Adiciona um membro pelo email
    const handleAddMember = async () => {
        if (!memberEmail.trim()) {
            Alert.alert("Atenção", "Digite o email do membro.");
            return;
        }
        if (!groupId) return;

        setAddingMember(true);
        try {
            const success = await groupService.addMemberByEmail(groupId, memberEmail.trim());
            if (success) {
                Alert.alert("Sucesso", `Membro ${memberEmail.trim()} adicionado ao grupo!`);
                setMemberEmail('');
                setShowAddMemberModal(false);
                fetchGroupDetails();
            } else {
                Alert.alert("Erro", "Não foi possível adicionar o membro. Verifique se o email está correto e se o usuário está cadastrado.");
            }
        } catch (error) {
            console.error("Erro ao adicionar membro:", error);
            Alert.alert("Erro", "Erro ao adicionar membro.");
        } finally {
            setAddingMember(false);
        }
    };

    // Remove um membro com confirmação
    const handleRemoveMember = (memberId: string, memberEmail: string) => {
        if (!groupId) return;
        Alert.alert(
            "Remover Membro",
            `Remover "${memberEmail}" do grupo?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    onPress: async () => {
                        try {
                            await groupService.removeMember(groupId, memberId);
                            fetchGroupDetails();
                        } catch (error) {
                            console.error("Erro ao remover membro:", error);
                            Alert.alert("Erro", "Não foi possível remover o membro.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // Carrega playlists do usuário para o modal de compartilhar
    const fetchUserPlaylists = async () => {
        setLoadingPlaylists(true);
        try {
            const playlists = await playlistService.getAllUserPlaylists();
            // Filtra playlists que já estão compartilhadas no grupo
            const sharedIds = new Set(group?.sharedPlaylistIds || []);
            const available = playlists.filter(p => !sharedIds.has(p.id));
            setUserPlaylists(available);
        } catch (error) {
            console.error("Erro ao buscar playlists:", error);
            Alert.alert("Erro", "Não foi possível carregar suas playlists.");
        } finally {
            setLoadingPlaylists(false);
        }
    };

    // Abre o modal de compartilhar playlist e carrega as playlists
    const openSharePlaylistModal = () => {
        setShowSharePlaylistModal(true);
        fetchUserPlaylists();
    };

    // Compartilha uma playlist no grupo
    const handleSharePlaylist = async (playlistId: string) => {
        if (!groupId) return;
        try {
            await groupService.sharePlaylistToGroup(groupId, playlistId);
            Alert.alert("Sucesso", "Playlist compartilhada no grupo!");
            setShowSharePlaylistModal(false);
            fetchGroupDetails();
        } catch (error) {
            console.error("Erro ao compartilhar playlist:", error);
            Alert.alert("Erro", "Não foi possível compartilhar a playlist.");
        }
    };

    // Remove uma playlist do grupo com confirmação
    const handleRemovePlaylist = (playlistId: string) => {
        if (!groupId) return;
        Alert.alert(
            "Remover Playlist",
            "Remover esta playlist do grupo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    onPress: async () => {
                        try {
                            await groupService.removePlaylistFromGroup(groupId, playlistId);
                            fetchGroupDetails();
                        } catch (error) {
                            console.error("Erro ao remover playlist:", error);
                            Alert.alert("Erro", "Não foi possível remover a playlist.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // Tela de carregamento
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    // Grupo não encontrado
    if (!group) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={detalhesStyles.emptyText}>Grupo não encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header com botão voltar, título e ações do dono */}
            <View style={detalhesStyles.header}>
                <Pressable onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 50, zIndex: 1 }}>
                    <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                </Pressable>
                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 60 }}>
                    <Text style={detalhesStyles.headerTitle} numberOfLines={1}>{group.name}</Text>
                </View>
                {isOwner && (
                    <>
                        <Pressable onPress={() => setIsEditing(!isEditing)} style={detalhesStyles.headerButton}>
                            <Feather name={isEditing ? "x-circle" : "edit"} size={22} color={isEditing ? "#FFC107" : "#3E9C9C"} />
                        </Pressable>
                        <Pressable onPress={handleDeleteGroup} style={detalhesStyles.headerButton}>
                            <Feather name="trash-2" size={22} color="#FF6347" />
                        </Pressable>
                    </>
                )}
            </View>

            <ScrollView contentContainerStyle={detalhesStyles.scrollViewContent}>
                {/* Seção de edição (visível somente para o dono) */}
                {isEditing ? (
                    <View style={detalhesStyles.editContainer}>
                        <Text style={detalhesStyles.label}>Nome do Grupo</Text>
                        <TextInput
                            value={editedName}
                            onChangeText={setEditedName}
                            style={detalhesStyles.inputField}
                            placeholderTextColor="grey"
                        />
                        <Text style={detalhesStyles.label}>Descrição</Text>
                        <TextInput
                            style={[detalhesStyles.inputField, detalhesStyles.textArea]}
                            value={editedDescription}
                            onChangeText={setEditedDescription}
                            placeholder="Descrição do grupo..."
                            placeholderTextColor="grey"
                            multiline
                        />
                        <Pressable style={detalhesStyles.saveButton} onPress={handleUpdateGroup}>
                            <Text style={detalhesStyles.saveButtonText}>Salvar Alterações</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {/* Informações do grupo */}
                        {group.description ? (
                            <Text style={detalhesStyles.description}>{group.description}</Text>
                        ) : (
                            <View style={{ marginTop: 10 }} />
                        )}

                        {/* Badge de dono */}
                        {isOwner && (
                            <View style={detalhesStyles.ownerBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#3E9C9C" />
                                <Text style={detalhesStyles.ownerBadgeText}>Você é o dono deste grupo</Text>
                            </View>
                        )}
                    </>
                )}

                {/* === SEÇÃO DE MEMBROS === */}
                <View style={detalhesStyles.sectionHeader}>
                    <Ionicons name="people" size={20} color="#3E9C9C" />
                    <Text style={detalhesStyles.sectionTitle}>Membros ({group.memberEmails.length})</Text>
                </View>

                {/* Botão para adicionar membro */}
                <Pressable style={detalhesStyles.addButton} onPress={() => setShowAddMemberModal(true)}>
                    <AntDesign name="pluscircleo" size={20} color="#3E9C9C" />
                    <Text style={detalhesStyles.addButtonText}>Adicionar Membro</Text>
                </Pressable>

                {/* Lista de membros */}
                {group.memberEmails.map((email, index) => {
                    const memberId = group.memberIds[index];
                    const isMemberOwner = memberId === group.ownerId;

                    return (
                        <View key={memberId} style={detalhesStyles.memberItem}>
                            <View style={detalhesStyles.memberAvatar}>
                                <Ionicons name="person" size={20} color="#B0C4DE" />
                            </View>
                            <View style={detalhesStyles.memberInfo}>
                                <Text style={detalhesStyles.memberEmail} numberOfLines={1}>{email}</Text>
                                {isMemberOwner && (
                                    <Text style={detalhesStyles.memberRole}>Dono</Text>
                                )}
                            </View>
                            {/* Botão de remover (somente o dono pode remover membros, exceto ele mesmo) */}
                            {isOwner && !isMemberOwner && (
                                <Pressable
                                    onPress={() => handleRemoveMember(memberId, email)}
                                    style={detalhesStyles.removeButton}
                                >
                                    <Feather name="x-circle" size={20} color="#FF6347" />
                                </Pressable>
                            )}
                        </View>
                    );
                })}

                {/* === SEÇÃO DE PLAYLISTS COMPARTILHADAS === */}
                <View style={[detalhesStyles.sectionHeader, { marginTop: 30 }]}>
                    <MaterialIcons name="playlist-play" size={24} color="#3E9C9C" />
                    <Text style={detalhesStyles.sectionTitle}>Playlists Compartilhadas ({group.sharedPlaylistIds.length})</Text>
                </View>

                {/* Botão para compartilhar playlist */}
                <Pressable style={detalhesStyles.addButton} onPress={openSharePlaylistModal}>
                    <AntDesign name="pluscircleo" size={20} color="#3E9C9C" />
                    <Text style={detalhesStyles.addButtonText}>Compartilhar Playlist</Text>
                </Pressable>

                {/* Lista de playlists compartilhadas */}
                {group.sharedPlaylistIds.length > 0 ? (
                    group.sharedPlaylistIds.map((playlistId) => (
                        <View key={playlistId} style={detalhesStyles.playlistItem}>
                            <MaterialIcons name="queue-music" size={22} color="#B0C4DE" />
                            <Text style={detalhesStyles.playlistIdText} numberOfLines={1}>
                                Playlist: {playlistId.substring(0, 12)}...
                            </Text>
                            {isOwner && (
                                <Pressable
                                    onPress={() => handleRemovePlaylist(playlistId)}
                                    style={detalhesStyles.removeButton}
                                >
                                    <Feather name="x-circle" size={20} color="#FF6347" />
                                </Pressable>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={detalhesStyles.emptyText}>Nenhuma playlist compartilhada.</Text>
                )}
            </ScrollView>

            {/* === MODAL: ADICIONAR MEMBRO === */}
            <Modal animationType="slide" transparent={true} visible={showAddMemberModal} onRequestClose={() => setShowAddMemberModal(false)}>
                <View style={detalhesStyles.modalBackground}>
                    <View style={detalhesStyles.modalContainer}>
                        <View style={detalhesStyles.modalHeader}>
                            <Text style={detalhesStyles.modalTitle}>Adicionar Membro</Text>
                            <Pressable onPress={() => setShowAddMemberModal(false)}>
                                <AntDesign name="closecircle" size={24} color="#eaeaea" />
                            </Pressable>
                        </View>

                        <Text style={detalhesStyles.modalLabel}>Email do membro</Text>
                        <TextInput
                            style={detalhesStyles.modalInput}
                            placeholder="exemplo@email.com"
                            placeholderTextColor="grey"
                            value={memberEmail}
                            onChangeText={setMemberEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Pressable
                            style={[detalhesStyles.modalButton, addingMember && { opacity: 0.6 }]}
                            onPress={handleAddMember}
                            disabled={addingMember}
                        >
                            {addingMember ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={detalhesStyles.modalButtonText}>Adicionar</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* === MODAL: COMPARTILHAR PLAYLIST === */}
            <Modal animationType="slide" transparent={true} visible={showSharePlaylistModal} onRequestClose={() => setShowSharePlaylistModal(false)}>
                <View style={detalhesStyles.modalBackground}>
                    <View style={[detalhesStyles.modalContainer, { height: '80%' }]}>
                        <View style={detalhesStyles.modalHeader}>
                            <Text style={detalhesStyles.modalTitle}>Compartilhar Playlist</Text>
                            <Pressable onPress={() => setShowSharePlaylistModal(false)}>
                                <AntDesign name="closecircle" size={24} color="#eaeaea" />
                            </Pressable>
                        </View>

                        {loadingPlaylists ? (
                            <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
                                data={userPlaylists}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Pressable style={detalhesStyles.modalPlaylistItem} onPress={() => handleSharePlaylist(item.id)}>
                                        <MaterialIcons name="queue-music" size={22} color="#B0C4DE" />
                                        <View style={detalhesStyles.modalPlaylistInfo}>
                                            <Text style={detalhesStyles.modalPlaylistName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={detalhesStyles.modalPlaylistCount}>{item.movieIds.length} filme(s)</Text>
                                        </View>
                                        <MaterialIcons name="add-circle-outline" size={24} color="#3E9C9C" />
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <Text style={detalhesStyles.emptyText}>Nenhuma playlist disponível para compartilhar.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default DetalhesGrupoScreen;

const detalhesStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerButton: {
        padding: 5,
        marginLeft: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    description: {
        color: '#B0C4DE',
        fontSize: 15,
        marginVertical: 15,
        lineHeight: 22,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    ownerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3E9C9C',
    },
    ownerBadgeText: {
        color: '#3E9C9C',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderColor: '#3E9C9C',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: '#3E9C9C',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    // Estilos dos itens de membro
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        marginBottom: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    memberAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2E3D50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberEmail: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    memberRole: {
        color: '#3E9C9C',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    removeButton: {
        padding: 5,
    },
    // Estilos dos itens de playlist
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        marginBottom: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    playlistIdText: {
        color: '#FFFFFF',
        fontSize: 14,
        flex: 1,
        marginLeft: 10,
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    // Estilos de edição
    editContainer: {
        backgroundColor: '#1A2B3E',
        borderRadius: 10,
        padding: 20,
        marginVertical: 20,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputField: {
        fontSize: 16,
        backgroundColor: '#2E3D50',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        minHeight: 50,
        color: '#eaeaea',
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    saveButton: {
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos dos modais
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#2E3D50',
        borderRadius: 15,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalLabel: {
        color: '#B0C4DE',
        fontSize: 14,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#1A2B3E',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        color: '#eaeaea',
        fontSize: 16,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos dos itens de playlist no modal
    modalPlaylistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#4A6B8A',
    },
    modalPlaylistInfo: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    modalPlaylistName: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    modalPlaylistCount: {
        color: '#B0C4DE',
        fontSize: 12,
        marginTop: 2,
    },
});
