// aplicativo/src/services/GroupService.ts
// Service Singleton para operações CRUD de Grupos de Amigos
import { Group } from '../models/Group';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';

export class GroupService {
    private static instance: GroupService;
    private db = getFirestore(app);

    private constructor() {}

    // Retorna a instância única do serviço (padrão Singleton)
    public static getInstance(): GroupService {
        if (!GroupService.instance) {
            GroupService.instance = new GroupService();
        }
        return GroupService.instance;
    }

    // Obtém o ID do usuário autenticado atualmente
    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    // Obtém o email do usuário autenticado atualmente
    private getCurrentUserEmail(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.email || null;
    }

    // Referência à coleção global de grupos
    private getGroupsCollection() {
        return collection(this.db, 'groups');
    }

    /**
     * Cria um novo grupo com o usuário atual como dono e primeiro membro.
     * @param name - Nome do grupo (obrigatório)
     * @param description - Descrição do grupo (opcional)
     * @returns O grupo criado
     */
    public async createGroup(name: string, description?: string): Promise<Group> {
        const userId = this.getCurrentUserId();
        const userEmail = this.getCurrentUserEmail();
        if (!userId || !userEmail) {
            console.error("Usuário não autenticado. Não é possível criar grupo.");
            throw new Error("Usuário não autenticado.");
        }

        const newGroupData = {
            name: name,
            description: description || null,
            ownerId: userId,
            memberIds: [userId], // O criador é o primeiro membro
            memberEmails: [userEmail], // Email do criador
            sharedPlaylistIds: [],
            timestamp: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(this.getGroupsCollection(), newGroupData);
            console.log("Novo grupo criado com sucesso com ID:", docRef.id);
            return new Group({ id: docRef.id, ...newGroupData });
        } catch (e) {
            console.error("Erro ao criar grupo: ", e);
            throw e;
        }
    }

    /**
     * Busca todos os grupos onde o usuário atual é membro.
     * Usa query com array-contains para filtrar pelo userId.
     * @returns Lista de grupos ordenados por timestamp descendente
     */
    public async getAllUserGroups(): Promise<Group[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando grupos vazios.");
            return [];
        }

        const parseGroups = (querySnapshot: any): Group[] => {
            const groups: Group[] = [];
            querySnapshot.forEach((doc: any) => {
                const data = doc.data();
                groups.push(new Group({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    ownerId: data.ownerId,
                    memberIds: data.memberIds || [],
                    memberEmails: data.memberEmails || [],
                    sharedPlaylistIds: data.sharedPlaylistIds || [],
                    timestamp: data.timestamp,
                }));
            });
            return groups;
        };

        try {
            // Busca grupos onde o userId está no array memberIds
            const q = query(
                this.getGroupsCollection(),
                where('memberIds', 'array-contains', userId),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return parseGroups(querySnapshot);
        } catch (e: any) {
            // Se for erro de permissão ou índice, tenta fallback sem orderBy
            if (e?.code === 'permission-denied' || e?.code === 'failed-precondition') {
                console.warn(`Firestore ${e.code} na query com orderBy. Tentando fallback sem ordenação...`);
                try {
                    const fallbackQuery = query(
                        this.getGroupsCollection(),
                        where('memberIds', 'array-contains', userId)
                    );
                    const fallbackSnapshot = await getDocs(fallbackQuery);
                    const groups = parseGroups(fallbackSnapshot);
                    // Ordena manualmente por timestamp descendente
                    groups.sort((a, b) => {
                        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                        return tB - tA;
                    });
                    return groups;
                } catch (fallbackError) {
                    console.error("Erro no fallback ao buscar grupos: ", fallbackError);
                    return [];
                }
            }
            console.error("Erro ao buscar todos os grupos do usuário: ", e);
            return [];
        }
    }

    /**
     * Busca um grupo específico pelo seu ID.
     * @param groupId - ID do grupo
     * @returns O grupo encontrado ou undefined se não existir
     */
    public async getGroupById(groupId: string): Promise<Group | undefined> {
        try {
            const docRef = doc(this.db, 'groups', groupId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return new Group({
                    id: docSnap.id,
                    name: data.name,
                    description: data.description,
                    ownerId: data.ownerId,
                    memberIds: data.memberIds || [],
                    memberEmails: data.memberEmails || [],
                    sharedPlaylistIds: data.sharedPlaylistIds || [],
                    timestamp: data.timestamp,
                });
            } else {
                console.log("Nenhum grupo encontrado com o ID:", groupId);
                return undefined;
            }
        } catch (e) {
            console.error("Erro ao buscar grupo por ID: ", e);
            throw e;
        }
    }

    /**
     * Atualiza os dados de um grupo (nome e/ou descrição).
     * @param groupId - ID do grupo a ser atualizado
     * @param updates - Campos a serem atualizados
     */
    public async updateGroup(groupId: string, updates: { name?: string; description?: string | null }): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar grupo.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const groupRef = doc(this.db, 'groups', groupId);
            await updateDoc(groupRef, { ...updates, timestamp: new Date().toISOString() });
            console.log("Grupo atualizado com sucesso com ID:", groupId);
        } catch (e) {
            console.error("Erro ao atualizar grupo: ", e);
            throw e;
        }
    }

    /**
     * Exclui um grupo. Somente o dono (owner) pode excluir.
     * @param groupId - ID do grupo a ser excluído
     */
    public async deleteGroup(groupId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar grupo.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            // Verifica se o usuário é o dono do grupo
            const group = await this.getGroupById(groupId);
            if (!group) {
                throw new Error("Grupo não encontrado.");
            }
            if (group.ownerId !== userId) {
                throw new Error("Somente o dono do grupo pode excluí-lo.");
            }

            await deleteDoc(doc(this.db, 'groups', groupId));
            console.log("Grupo deletado com sucesso com ID:", groupId);
        } catch (e) {
            console.error("Erro ao deletar grupo: ", e);
            throw e;
        }
    }

    /**
     * Adiciona um membro ao grupo pelo email.
     * Busca o userId na coleção userProfiles pelo campo email.
     * @param groupId - ID do grupo
     * @param email - Email do novo membro
     * @returns true se o membro foi adicionado com sucesso, false caso contrário
     */
    public async addMemberByEmail(groupId: string, email: string): Promise<boolean> {
        try {
            // Busca o perfil do usuário pelo email na coleção userProfiles
            const userProfilesRef = collection(this.db, 'userProfiles');
            const q = query(userProfilesRef, where('email', '==', email.trim().toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("Nenhum usuário encontrado com o email:", email);
                return false;
            }

            const userProfileDoc = querySnapshot.docs[0];
            const newMemberId = userProfileDoc.id;
            const memberEmail = email.trim().toLowerCase();

            // Busca o grupo atual para verificar se o membro já existe
            const group = await this.getGroupById(groupId);
            if (!group) {
                console.error("Grupo não encontrado.");
                return false;
            }

            // Verifica se o membro já está no grupo
            if (group.memberIds.includes(newMemberId)) {
                console.log("Usuário já é membro do grupo.");
                return false;
            }

            // Adiciona o novo membro aos arrays
            const updatedMemberIds = [...group.memberIds, newMemberId];
            const updatedMemberEmails = [...group.memberEmails, memberEmail];

            const groupRef = doc(this.db, 'groups', groupId);
            await updateDoc(groupRef, {
                memberIds: updatedMemberIds,
                memberEmails: updatedMemberEmails,
                timestamp: new Date().toISOString(),
            });

            console.log(`Membro ${email} adicionado ao grupo ${groupId}.`);
            return true;
        } catch (e) {
            console.error("Erro ao adicionar membro por email: ", e);
            return false;
        }
    }

    /**
     * Remove um membro do grupo. O dono (owner) não pode ser removido.
     * @param groupId - ID do grupo
     * @param memberId - ID do membro a ser removido
     */
    public async removeMember(groupId: string, memberId: string): Promise<void> {
        try {
            const group = await this.getGroupById(groupId);
            if (!group) {
                throw new Error("Grupo não encontrado.");
            }

            // O dono não pode ser removido do grupo
            if (memberId === group.ownerId) {
                throw new Error("O dono do grupo não pode ser removido.");
            }

            // Encontra o índice do membro para remover o email correspondente
            const memberIndex = group.memberIds.indexOf(memberId);
            if (memberIndex === -1) {
                console.log("Membro não encontrado no grupo.");
                return;
            }

            // Remove o membro dos arrays memberIds e memberEmails
            const updatedMemberIds = group.memberIds.filter(id => id !== memberId);
            const updatedMemberEmails = group.memberEmails.filter((_, index) => index !== memberIndex);

            const groupRef = doc(this.db, 'groups', groupId);
            await updateDoc(groupRef, {
                memberIds: updatedMemberIds,
                memberEmails: updatedMemberEmails,
                timestamp: new Date().toISOString(),
            });

            console.log(`Membro ${memberId} removido do grupo ${groupId}.`);
        } catch (e) {
            console.error("Erro ao remover membro: ", e);
            throw e;
        }
    }

    /**
     * Compartilha uma playlist no grupo. Evita duplicatas.
     * @param groupId - ID do grupo
     * @param playlistId - ID da playlist a ser compartilhada
     */
    public async sharePlaylistToGroup(groupId: string, playlistId: string): Promise<void> {
        try {
            const group = await this.getGroupById(groupId);
            if (!group) {
                throw new Error("Grupo não encontrado.");
            }

            // Evita duplicatas - verifica se a playlist já está compartilhada
            if (group.sharedPlaylistIds.includes(playlistId)) {
                console.log(`Playlist ${playlistId} já está compartilhada no grupo ${groupId}.`);
                return;
            }

            const updatedSharedPlaylistIds = [...group.sharedPlaylistIds, playlistId];

            const groupRef = doc(this.db, 'groups', groupId);
            await updateDoc(groupRef, {
                sharedPlaylistIds: updatedSharedPlaylistIds,
                timestamp: new Date().toISOString(),
            });

            console.log(`Playlist ${playlistId} compartilhada no grupo ${groupId}.`);
        } catch (e) {
            console.error("Erro ao compartilhar playlist no grupo: ", e);
            throw e;
        }
    }

    /**
     * Remove uma playlist compartilhada do grupo.
     * @param groupId - ID do grupo
     * @param playlistId - ID da playlist a ser removida
     */
    public async removePlaylistFromGroup(groupId: string, playlistId: string): Promise<void> {
        try {
            const group = await this.getGroupById(groupId);
            if (!group) {
                throw new Error("Grupo não encontrado.");
            }

            const updatedSharedPlaylistIds = group.sharedPlaylistIds.filter(id => id !== playlistId);

            const groupRef = doc(this.db, 'groups', groupId);
            await updateDoc(groupRef, {
                sharedPlaylistIds: updatedSharedPlaylistIds,
                timestamp: new Date().toISOString(),
            });

            console.log(`Playlist ${playlistId} removida do grupo ${groupId}.`);
        } catch (e) {
            console.error("Erro ao remover playlist do grupo: ", e);
            throw e;
        }
    }
}
