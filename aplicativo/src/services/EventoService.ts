// aplicativo/src/services/EventoService.ts
import { Evento } from '../models/Evento';
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

export class EventoService {
    private static instance: EventoService;
    private db = getFirestore(app);

    private constructor() {}

    public static getInstance(): EventoService {
        if (!EventoService.instance) {
            EventoService.instance = new EventoService();
        }
        return EventoService.instance;
    }

    // Retorna o ID do usuário autenticado ou null
    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    // Retorna a referência da subcoleção de eventos do usuário
    private getUserEventosCollection(userId: string) {
        return collection(this.db, `users/${userId}/eventos`);
    }

    // Cria um novo evento e retorna o objeto Evento criado
    public async createEvento(data: {
        cinemaName: string;
        cinemaLat: number;
        cinemaLon: number;
        movieId?: string | null;
        movieTitle?: string | null;
        dataHora: string;
        notas?: string | null;
    }): Promise<Evento> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar evento.");
            throw new Error("Usuário não autenticado.");
        }

        const newEventoData = {
            cinemaName: data.cinemaName,
            cinemaLat: data.cinemaLat,
            cinemaLon: data.cinemaLon,
            movieId: data.movieId ?? null,
            movieTitle: data.movieTitle ?? null,
            dataHora: data.dataHora,
            notas: data.notas ?? null,
            timestamp: new Date().toISOString(),
        };

        try {
            const docRef = await addDoc(this.getUserEventosCollection(userId), newEventoData);
            console.log("Novo evento criado com sucesso com ID:", docRef.id);
            return new Evento({ id: docRef.id, ...newEventoData });
        } catch (e) {
            console.error("Erro ao criar evento: ", e);
            throw e;
        }
    }

    // Retorna todos os eventos do usuário, ordenados por dataHora descendente
    public async getAllUserEventos(): Promise<Evento[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando eventos vazios.");
            return [];
        }

        try {
            const q = query(this.getUserEventosCollection(userId), orderBy("dataHora", "desc"));
            const querySnapshot = await getDocs(q);

            const eventos: Evento[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                eventos.push(new Evento({
                    id: doc.id,
                    cinemaName: data.cinemaName,
                    cinemaLat: data.cinemaLat,
                    cinemaLon: data.cinemaLon,
                    movieId: data.movieId,
                    movieTitle: data.movieTitle,
                    dataHora: data.dataHora,
                    notas: data.notas,
                    timestamp: data.timestamp,
                }));
            });
            return eventos;
        } catch (e) {
            console.error("Erro ao buscar todos os eventos do usuário: ", e);
            throw e;
        }
    }

    // Busca um evento específico pelo ID
    public async getEventoById(eventoId: string): Promise<Evento | undefined> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Não é possível buscar evento por ID.");
            return undefined;
        }

        try {
            const docRef = doc(this.db, `users/${userId}/eventos`, eventoId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return new Evento({
                    id: docSnap.id,
                    cinemaName: data.cinemaName,
                    cinemaLat: data.cinemaLat,
                    cinemaLon: data.cinemaLon,
                    movieId: data.movieId,
                    movieTitle: data.movieTitle,
                    dataHora: data.dataHora,
                    notas: data.notas,
                    timestamp: data.timestamp,
                });
            } else {
                console.log("Nenhum evento encontrado com o ID:", eventoId);
                return undefined;
            }
        } catch (e) {
            console.error("Erro ao buscar evento por ID: ", e);
            throw e;
        }
    }

    // Atualiza um evento existente com os dados fornecidos
    public async updateEvento(eventoId: string, updates: {
        cinemaName?: string;
        cinemaLat?: number;
        cinemaLon?: number;
        movieId?: string | null;
        movieTitle?: string | null;
        dataHora?: string;
        notas?: string | null;
    }): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar evento.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const eventoRef = doc(this.db, `users/${userId}/eventos`, eventoId);
            await updateDoc(eventoRef, { ...updates, timestamp: new Date().toISOString() });
            console.log("Evento atualizado com sucesso com ID:", eventoId);
        } catch (e) {
            console.error("Erro ao atualizar evento: ", e);
            throw e;
        }
    }

    // Deleta um evento pelo ID
    public async deleteEvento(eventoId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar evento.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            await deleteDoc(doc(this.db, `users/${userId}/eventos`, eventoId));
            console.log("Evento deletado com sucesso com ID:", eventoId);
        } catch (e) {
            console.error("Erro ao deletar evento: ", e);
            throw e;
        }
    }

    // Retorna apenas os eventos futuros (dataHora >= agora), ordenados por dataHora ascendente
    public async getEventosProximos(): Promise<Evento[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando eventos vazios.");
            return [];
        }

        try {
            // Busca todos os eventos ordenados por dataHora ascendente
            const q = query(this.getUserEventosCollection(userId), orderBy("dataHora", "asc"));
            const querySnapshot = await getDocs(q);

            const agora = new Date().toISOString();
            const eventosProximos: Evento[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Filtra apenas eventos com dataHora no futuro ou agora
                if (data.dataHora >= agora) {
                    eventosProximos.push(new Evento({
                        id: doc.id,
                        cinemaName: data.cinemaName,
                        cinemaLat: data.cinemaLat,
                        cinemaLon: data.cinemaLon,
                        movieId: data.movieId,
                        movieTitle: data.movieTitle,
                        dataHora: data.dataHora,
                        notas: data.notas,
                        timestamp: data.timestamp,
                    }));
                }
            });

            return eventosProximos;
        } catch (e) {
            console.error("Erro ao buscar eventos próximos: ", e);
            throw e;
        }
    }
}
