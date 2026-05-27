// aplicativo/src/services/DiarioCinemaService.ts
import { DiarioCinema } from '../models/DiarioCinema';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { supabase } from '../config/supabaseConfig';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export class DiarioCinemaService {
    private static instance: DiarioCinemaService;
    private db = getFirestore(app);

    private constructor() {}

    public static getInstance(): DiarioCinemaService {
        if (!DiarioCinemaService.instance) {
            DiarioCinemaService.instance = new DiarioCinemaService();
        }
        return DiarioCinemaService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    private getUserDiarioCollection(userId: string) {
        return collection(this.db, `users/${userId}/diario`);
    }

    // Upload de foto para o Supabase Storage com retry
    public async uploadFotoDiario(uri: string): Promise<string | null> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            throw new Error("Usuário não autenticado.");
        }

        try {
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
                return uri;
            }

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                console.error('Arquivo de imagem não encontrado:', uri);
                throw new Error('Arquivo de imagem não encontrado.');
            }

            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension) ? fileExtension : 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${validExtension}`;
            const filePath = `diary/${userId}/${fileName}`;

            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            if (!base64 || base64.length === 0) {
                throw new Error('Falha ao ler arquivo de imagem.');
            }

            const arrayBuffer = decode(base64);
            const contentTypeMap: Record<string, string> = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp' };
            const contentType = contentTypeMap[validExtension] || 'image/jpeg';

            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Upload diário tentativa ${attempt}/${maxRetries}...`);
                    const { data, error } = await supabase.storage
                        .from('diary_photos')
                        .upload(filePath, arrayBuffer, {
                            contentType: contentType,
                            upsert: true,
                        });

                    if (error) {
                        console.error(`Upload diário erro (tentativa ${attempt}):`, error.message);
                        throw error;
                    }

                    const publicUrl = supabase.storage.from('diary_photos').getPublicUrl(filePath);
                    console.log('Upload diário sucesso! URL:', publicUrl.data.publicUrl);
                    return publicUrl.data.publicUrl;
                } catch (uploadError: any) {
                    const errorMsg = uploadError?.message || '';
                    const isNetworkError = errorMsg.includes('Network request failed') ||
                                            uploadError?.name === 'StorageUnknownError' ||
                                            errorMsg.includes('Failed to fetch');
                    if (isNetworkError && attempt < maxRetries) {
                        const delay = attempt * 2000;
                        console.warn(`Upload diário tentativa ${attempt} falhou. Retentando em ${delay/1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        throw uploadError;
                    }
                }
            }
            return null;
        } catch (error: any) {
            console.error('Erro ao fazer upload da foto do diário:', error.message || error);
            throw error;
        }
    }

    // Deletar foto do Supabase Storage
    public async deleteFotoDiario(photoUrl: string): Promise<void> {
        if (photoUrl.includes('supabase.co/storage/v1/object/public/diary_photos/')) {
            try {
                const pathInBucket = photoUrl.split('/storage/v1/object/public/diary_photos/')[1];
                const { error } = await supabase.storage.from('diary_photos').remove([pathInBucket]);
                if (error) {
                    console.error('Erro ao deletar foto do diário:', error.message);
                } else {
                    console.log('Foto do diário deletada:', photoUrl);
                }
            } catch (error) {
                console.error('Erro no processo de deleção da foto do diário:', error);
            }
        }
    }

    // Cria uma nova entrada no diário
    public async createEntrada(data: {
        cinemaName: string;
        movieTitle?: string | null;
        data: string;
        fotos: string[];
        observacoes?: string | null;
    }): Promise<DiarioCinema> {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error("Usuário não autenticado.");

        const newEntrada = {
            cinemaName: data.cinemaName,
            movieTitle: data.movieTitle ?? null,
            data: data.data,
            fotos: data.fotos,
            observacoes: data.observacoes ?? null,
            timestamp: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(this.getUserDiarioCollection(userId), newEntrada);
            console.log("Nova entrada do diário criada:", docRef.id);
            return new DiarioCinema({ id: docRef.id, ...newEntrada });
        } catch (e) {
            console.error("Erro ao criar entrada do diário:", e);
            throw e;
        }
    }

    // Retorna todas as entradas do diário, ordenadas por data desc
    public async getAllEntradas(): Promise<DiarioCinema[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        try {
            const q = query(this.getUserDiarioCollection(userId), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const entradas: DiarioCinema[] = [];
            querySnapshot.forEach((doc) => {
                const d = doc.data();
                entradas.push(new DiarioCinema({
                    id: doc.id,
                    cinemaName: d.cinemaName,
                    movieTitle: d.movieTitle,
                    data: d.data,
                    fotos: d.fotos || [],
                    observacoes: d.observacoes,
                    timestamp: d.timestamp,
                }));
            });
            return entradas;
        } catch (e) {
            console.error("Erro ao buscar entradas do diário:", e);
            throw e;
        }
    }

    // Deleta uma entrada e suas fotos
    public async deleteEntrada(entradaId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error("Usuário não autenticado.");

        try {
            // Busca a entrada para pegar as URLs das fotos
            const docRef = doc(this.db, `users/${userId}/diario`, entradaId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Deleta todas as fotos do Supabase
                if (data.fotos && data.fotos.length > 0) {
                    for (const fotoUrl of data.fotos) {
                        await this.deleteFotoDiario(fotoUrl);
                    }
                }
            }

            await deleteDoc(docRef);
            console.log("Entrada do diário deletada:", entradaId);
        } catch (e) {
            console.error("Erro ao deletar entrada do diário:", e);
            throw e;
        }
    }
}
