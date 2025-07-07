// aplicativo/src/services/PlaylistService.ts
import { Playlist } from '../models/Playlist';
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

export class PlaylistService {
    private static instance: PlaylistService;
    private db = getFirestore(app);

    private constructor() {}

    public static getInstance(): PlaylistService {
        if (!PlaylistService.instance) {
            PlaylistService.instance = new PlaylistService();
        }
        return PlaylistService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    private getUserPlaylistsCollection(userId: string) {
        return collection(this.db, `users/${userId}/playlists`);
    }

    public async createPlaylist(name: string, description?: string, movieIds: string[] = []): Promise<Playlist> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar playlist.");
            throw new Error("Usuário não autenticado.");
        }

        const newPlaylistData = {
            userId: userId,
            name: name,
            description: description || null,
            movieIds: movieIds,
            timestamp: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(this.getUserPlaylistsCollection(userId), newPlaylistData);
            console.log("Nova playlist criada com sucesso com ID:", docRef.id);
            return new Playlist({ id: docRef.id, ...newPlaylistData });
        } catch (e) {
            console.error("Erro ao criar playlist: ", e);
            throw e;
        }
    }

    public async getAllUserPlaylists(): Promise<Playlist[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando playlists vazias.");
            return [];
        }

        try {
            const q = query(this.getUserPlaylistsCollection(userId), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            const playlists: Playlist[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                playlists.push(new Playlist({
                    id: doc.id,
                    userId: data.userId,
                    name: data.name,
                    description: data.description,
                    movieIds: data.movieIds || [],
                    timestamp: data.timestamp,
                }));
            });
            return playlists;
        } catch (e) {
            console.error("Erro ao buscar todas as playlists do usuário: ", e);
            throw e;
        }
    }

    public async getPlaylistById(playlistId: string): Promise<Playlist | undefined> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Não é possível buscar playlist por ID.");
            return undefined;
        }

        try {
            const docRef = doc(this.db, `users/${userId}/playlists`, playlistId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return new Playlist({
                    id: docSnap.id,
                    userId: data.userId,
                    name: data.name,
                    description: data.description,
                    movieIds: data.movieIds || [],
                    timestamp: data.timestamp,
                });
            } else {
                console.log("Nenhuma playlist encontrada com o ID:", playlistId);
                return undefined;
            }
        } catch (e) {
            console.error("Erro ao buscar playlist por ID: ", e);
            throw e;
        }
    }

    public async updatePlaylist(playlistId: string, updates: { name?: string; description?: string | null; movieIds?: string[] }): Promise<void> { // Allow description to be null
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar playlist.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const playlistRef = doc(this.db, `users/${userId}/playlists`, playlistId);
            await updateDoc(playlistRef, { ...updates, timestamp: new Date().toISOString() });
            console.log("Playlist atualizada com sucesso com ID:", playlistId);
        } catch (e) {
            console.error("Erro ao atualizar playlist: ", e);
            throw e;
        }
    }

    public async addMovieToPlaylist(playlistId: string, movieId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível adicionar filme à playlist.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const playlist = await this.getPlaylistById(playlistId);
            if (playlist) {
                if (!playlist.movieIds.includes(movieId)) {
                    const updatedMovieIds = [...playlist.movieIds, movieId];
                    await this.updatePlaylist(playlistId, { movieIds: updatedMovieIds });
                    console.log(`Filme ${movieId} adicionado à playlist ${playlistId}.`);
                } else {
                    console.log(`Filme ${movieId} já está na playlist ${playlistId}.`);
                }
            } else {
                throw new Error("Playlist não encontrada.");
            }
        } catch (e) {
            console.error("Erro ao adicionar filme à playlist: ", e);
            throw e;
        }
    }

    // Corrigido para retornar boolean se a playlist foi deletada
    public async removeMovieFromPlaylist(playlistId: string, movieId: string): Promise<boolean> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível remover filme da playlist.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const playlist = await this.getPlaylistById(playlistId);
            if (playlist) {
                const updatedMovieIds = playlist.movieIds.filter(id => id !== movieId);
                
                if (updatedMovieIds.length === 0) {
                    // Se a playlist ficar vazia, a deleta
                    await this.deletePlaylist(playlistId);
                    console.log(`Playlist ${playlistId} deletada por estar vazia.`);
                    return true; // Indica que a playlist foi deletada
                } else if (updatedMovieIds.length < playlist.movieIds.length) { // Só atualiza se o filme foi realmente removido
                    await this.updatePlaylist(playlistId, { movieIds: updatedMovieIds });
                    console.log(`Filme ${movieId} removido da playlist ${playlistId}.`);
                    return false; // Indica que a playlist foi apenas atualizada
                } else {
                    console.log(`Filme ${movieId} não encontrado na playlist ${playlistId}.`);
                    return false; // Filme não estava na playlist
                }
            } else {
                throw new Error("Playlist não encontrada.");
            }
        } catch (e) {
            console.error("Erro ao remover filme da playlist: ", e);
            throw e;
        }
    }

    public async deletePlaylist(playlistId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar playlist.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            await deleteDoc(doc(this.db, `users/${userId}/playlists`, playlistId));
            console.log("Playlist deletada com sucesso com ID:", playlistId);
        } catch (e) {
            console.error("Erro ao deletar playlist: ", e);
            throw e;
        }
    }
}