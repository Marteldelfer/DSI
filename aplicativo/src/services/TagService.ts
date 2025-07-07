// aplicativo/src/services/TagService.ts
import { Tag } from '../models/Tag';
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
    orderBy, // Adicionado para ordenar tags
    getDoc, // Adicionado para buscar uma única tag se necessário
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig'; // Importa 'app' do firebaseConfig
import { getAuth } from 'firebase/auth'; // Importe getAuth para obter o UID do usuário

export class TagService {
    private static instance: TagService;
    private db = getFirestore(app); // Inicializa o Firestore

    private constructor() {}

    public static getInstance(): TagService {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }
        return TagService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app); // Obtém a instância de autenticação
        return auth.currentUser?.uid || null; // Retorna o UID do usuário logado
    }

    // Retorna a coleção de tags para um usuário específico
    private getUserTagsCollection(userId: string) {
        return collection(this.db, `users/${userId}/tags`);
    }

    // Cria uma nova tag ou atualiza uma existente para um filme e tipo específico
    public async createTag(movieId: string, type: string, value: string): Promise<Tag> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar/atualizar tag.");
            throw new Error("Usuário não autenticado.");
        }

        const newTagData = {
            movieId: movieId,
            type: type,
            value: value,
            timestamp: new Date().toISOString(), // Adiciona o timestamp
        };

        try {
            // Verifica se uma tag do mesmo tipo já existe para este filme
            const q = query(
                this.getUserTagsCollection(userId),
                where("movieId", "==", movieId),
                where("type", "==", type)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Tag existe, atualiza
                const existingTagDoc = querySnapshot.docs[0];
                await updateDoc(doc(this.db, `users/${userId}/tags`, existingTagDoc.id), newTagData);
                console.log("Tag atualizada com sucesso com ID:", existingTagDoc.id);
                return new Tag({ id: existingTagDoc.id, ...newTagData });
            } else {
                // Tag não existe, cria uma nova
                const docRef = await addDoc(this.getUserTagsCollection(userId), newTagData);
                const newTag = new Tag({ id: docRef.id, ...newTagData });
                console.log("Nova tag criada com sucesso com ID:", docRef.id);
                return newTag;
            }
        } catch (e) {
            console.error("Erro ao criar/atualizar tag: ", e);
            throw e;
        }
    }

    // Busca todas as tags para um filme específico
    public async getTagsByMovieId(movieId: string): Promise<Tag[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando tags vazias.");
            return [];
        }

        try {
            const q = query(this.getUserTagsCollection(userId), where("movieId", "==", movieId), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            const tags: Tag[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                tags.push(new Tag({
                    id: doc.id,
                    movieId: data.movieId,
                    type: data.type,
                    value: data.value,
                    timestamp: data.timestamp,
                }));
            });
            return tags;
        } catch (e) {
            console.error("Erro ao buscar tags por filmeId: ", e);
            throw e;
        }
    }

    // Busca uma tag por seu ID de documento (opcional, pode não ser necessário dependendo do uso)
    public async getTagById(tagDocId: string): Promise<Tag | undefined> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Não é possível buscar tag por ID.");
            return undefined;
        }

        try {
            const docRef = doc(this.db, `users/${userId}/tags`, tagDocId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return new Tag({
                    id: docSnap.id,
                    movieId: data.movieId,
                    type: data.type,
                    value: data.value,
                    timestamp: data.timestamp,
                });
            } else {
                console.log("Nenhuma tag encontrada com o ID:", tagDocId);
                return undefined;
            }
        } catch (e) {
            console.error("Erro ao buscar tag por ID: ", e);
            throw e;
        }
    }

    // Atualiza o conteúdo de uma tag existente (se o ID da tag Firestore for conhecido)
    // O createTag já lida com upsert por movieId e type, então este pode ser menos usado
    public async updateTag(tagDocId: string, newType: string, newValue: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar tag.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const tagRef = doc(this.db, `users/${userId}/tags`, tagDocId);
            await updateDoc(tagRef, { type: newType, value: newValue, timestamp: new Date().toISOString() });
            console.log("Tag atualizada com sucesso com ID:", tagDocId);
        } catch (e) {
            console.error("Erro ao atualizar tag: ", e);
            throw e;
        }
    }

    // Deleta uma tag
    public async deleteTag(tagDocId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar tag.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const tagRef = doc(this.db, `users/${userId}/tags`, tagDocId);
            await deleteDoc(tagRef);
            console.log("Tag deletada com sucesso com ID:", tagDocId);
        } catch (e) {
            console.error("Erro ao deletar tag: ", e);
            throw e;
        }
    }

    // Deleta todas as tags de um filme específico (útil ao deletar um filme)
    public async deleteTagsByMovieId(movieId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar tags por filmeId.");
            throw new Error("Usuário não autenticado.");
        }
        
        try {
            const q = query(this.getUserTagsCollection(userId), where("movieId", "==", movieId));
            const querySnapshot = await getDocs(q);
            
            const deletePromises: Promise<void>[] = [];
            querySnapshot.forEach((docSnap) => {
                deletePromises.push(deleteDoc(doc(this.db, `users/${userId}/tags`, docSnap.id)));
            });
            await Promise.all(deletePromises);
            console.log(`Todas as tags para o filme ${movieId} deletadas.`);
        } catch (e) {
            console.error(`Erro ao deletar tags para o filme ${movieId}: `, e);
            throw e;
        }
    }

    // Busca TODAS as tags do usuário atual (útil para pré-preencher MovieService)
    public async getAllUserTags(): Promise<Tag[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando tags vazias.");
            return [];
        }

        try {
            const q = query(this.getUserTagsCollection(userId)); // Sem filtro por movieId
            const querySnapshot = await getDocs(q);
            
            const tags: Tag[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                tags.push(new Tag({
                    id: doc.id,
                    movieId: data.movieId,
                    type: data.type,
                    value: data.value,
                    timestamp: data.timestamp,
                }));
            });
            return tags;
        } catch (e) {
            console.error("Erro ao buscar todas as tags do usuário: ", e);
            throw e;
        }
    }
}