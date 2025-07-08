// aplicativo/src/services/TagService.ts
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    doc,
    Timestamp,
    orderBy,
    limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebaseConfig';
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../models/Tag';

export class TagService {
    private static instance: TagService;
    private db = getFirestore(app);
    private auth = getAuth(app);

    private constructor() {}

    public static getInstance(): TagService {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }
        return TagService.instance;
    }

    private getCurrentUserId(): string | null {
        return this.auth.currentUser?.uid || null;
    }

    private getTagsCollection() {
        return collection(this.db, 'tags');
    }

    /**
     * Busca a tag mais recente de um usuário para um filme específico.
     */
    public async getTagForMovie(movieId: string): Promise<Tag | null> {
        const userId = this.getCurrentUserId();
        if (!userId) return null;

        try {
            const q = query(
                this.getTagsCollection(),
                where("userId", "==", userId),
                where("movieId", "==", movieId),
                orderBy("timestamp", "desc"),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                return new Tag({ id: docSnap.id, ...docSnap.data() } as any);
            }
            return null;
        } catch (error) {
            console.error(`Erro ao buscar tag para o filme ${movieId}.`, error);
            return null;
        }
    }

    /**
     * Cria um novo documento de tag no Firestore.
     */
    public async createTag(data: { movieId: string; watched: WatchedStatus | null; interest: InterestStatus | null; rewatch: RewatchStatus | null; }): Promise<Tag> {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error("Usuário não autenticado para criar tag.");

        const newTagData = {
            userId: userId,
            movieId: data.movieId,
            watched: data.watched || null,
            interest: data.interest || null,
            rewatch: data.rewatch || null,
            timestamp: Timestamp.now(),
        };

        const docRef = await addDoc(this.getTagsCollection(), newTagData);
        return new Tag({ id: docRef.id, ...newTagData });
    }

    /**
     * Atualiza um documento de tag existente.
     */
    public async updateTag(tagId: string, updates: { watched: WatchedStatus | null; interest: InterestStatus | null; rewatch: RewatchStatus | null; }): Promise<void> {
        const tagRef = doc(this.db, 'tags', tagId);
        const dataToUpdate = { ...updates, timestamp: Timestamp.now() };
        await updateDoc(tagRef, dataToUpdate);
    }

    /**
     * Deleta um documento de tag.
     */
    public async deleteTag(tagId: string): Promise<void> {
        const tagRef = doc(this.db, 'tags', tagId);
        await deleteDoc(tagRef);
    }
}