// aplicativo/src/services/TagService.ts
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../models/Tag';
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
    getDoc,
    serverTimestamp // Importe serverTimestamp
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';

export class TagService {
    private static instance: TagService;
    private db = getFirestore(app);

    private constructor() {}

    public static getInstance(): TagService {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }
        return TagService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        const userId = auth.currentUser?.uid || null;
        return userId;
    }

    private getUserTagsCollection(userId: string) {
        return collection(this.db, `users/${userId}/tags`);
    }

    public async createTag(data: { 
        movieId: string; 
        watched: WatchedStatus | null; 
        interest: InterestStatus | null; 
        rewatch: RewatchStatus | null; 
    }): Promise<Tag> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("TagService: Usuário não autenticado. Não é possível criar tag.");
            throw new Error("Usuário não autenticado.");
        }

        const tagToCreate = {
            userId: userId,
            movieId: data.movieId,
            watched: data.watched,
            interest: data.interest,
            rewatch: data.rewatch,
            timestamp: serverTimestamp(), // Adiciona o timestamp do servidor
        };

        try {
            console.log("TagService: createTag - Tentando criar tag para userId:", userId, " movieId:", data.movieId); // LOG
            const docRef = await addDoc(this.getUserTagsCollection(userId), tagToCreate);
            const newTag = new Tag({ id: docRef.id, userId: userId, movieId: data.movieId, watched: data.watched, interest: data.interest, rewatch: data.rewatch }); 
            console.log("TagService: Tag criada com sucesso com ID:", docRef.id);
            return newTag;
        } catch (e) {
            console.error("TagService: Erro ao criar tag: ", e);
            throw e;
        }
    }

    public async updateTag(tagId: string, updates: {
        movieId?: string; 
        watched?: WatchedStatus | null;
        interest?: InterestStatus | null;
        rewatch?: RewatchStatus | null;
    }): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("TagService: Usuário não autenticado. Não é possível atualizar tag.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const tagRef = doc(this.db, `users/${userId}/tags`, tagId);
            console.log("TagService: updateTag - Tentando atualizar tag com ID:", tagId, " para userId:", userId); // LOG
            await updateDoc(tagRef, { ...updates, timestamp: serverTimestamp() }); 
            console.log("TagService: Tag atualizada com sucesso:", tagId);
        } catch (e) {
            console.error("TagService: Erro ao atualizar tag: ", e);
            throw e;
        }
    }

    public async deleteTag(tagId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("TagService: Usuário não autenticado. Não é possível deletar tag.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const tagRef = doc(this.db, `users/${userId}/tags`, tagId);
            console.log("TagService: deleteTag - Tentando deletar tag com ID:", tagId, " para userId:", userId); // LOG
            await deleteDoc(tagRef);
            console.log("TagService: Tag deletada com sucesso:", tagId);
        } catch (e) {
            console.error("TagService: Erro ao deletar tag: ", e);
            throw e;
        }
    }

    public async getTagForMovie(movieId: string): Promise<Tag | null> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("TagService: Usuário não autenticado. Não é possível buscar tag para o filme.");
            return null;
        }

        try {
            console.log("TagService: getTagForMovie - Tentando buscar tag para userId:", userId, " movieId:", movieId); // LOG
            const q = query(this.getUserTagsCollection(userId), where("movieId", "==", movieId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const data = docSnap.data();
                const timestampDate = data.timestamp ? data.timestamp.toDate() : undefined;
                return new Tag({ 
                    id: docSnap.id, 
                    userId: userId, 
                    movieId: data.movieId, 
                    watched: data.watched ?? null, 
                    interest: data.interest ?? null, 
                    rewatch: data.rewatch ?? null, 
                    timestamp: timestampDate 
                });
            }
            return null;
        } catch (e) {
            console.error("TagService: Erro ao buscar tag para o filme:", movieId, e);
            throw e;
        }
    }

    // NOVO MÉTODO: Obter todas as tags de um usuário
    public async getAllUserTags(): Promise<Tag[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("TagService: Usuário não autenticado. Não é possível buscar todas as tags.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            console.log("TagService: getAllUserTags - Tentando buscar todas as tags para userId:", userId); // LOG
            const querySnapshot = await getDocs(this.getUserTagsCollection(userId));
            const tags: Tag[] = [];
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                const timestampDate = data.timestamp ? data.timestamp.toDate() : undefined;
                tags.push(new Tag({
                    id: docSnap.id,
                    userId: userId,
                    movieId: data.movieId,
                    watched: data.watched ?? null,
                    interest: data.interest ?? null,
                    rewatch: data.rewatch ?? null,
                    timestamp: timestampDate
                }));
            });
            console.log(`TagService: Encontradas ${tags.length} tags para userId: ${userId}`);
            return tags;
        } catch (e) {
            console.error("TagService: Erro ao buscar todas as tags do usuário: ", e);
            throw e;
        }
    }
}
