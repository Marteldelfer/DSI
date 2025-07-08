// aplicativo/src/models/Tag.ts
import { Timestamp } from 'firebase/firestore';

export type WatchedStatus = "assistido" | "assistido_old" | "drop" | "nao_assistido";
export type InterestStatus = "sim" | "nao";
export type RewatchStatus = "sim" | "nao";

export class Tag {
    id: string; // ID do documento no Firestore
    userId: string; 
    movieId: string;
    watched: WatchedStatus | null;
    interest: InterestStatus | null;
    rewatch: RewatchStatus | null;
    timestamp?: Timestamp; // O Firestore usa seu próprio tipo Timestamp

    constructor(data: {
        id: string;
        userId: string;
        movieId: string;
        watched?: WatchedStatus | null;
        interest?: InterestStatus | null;
        rewatch?: RewatchStatus | null;
        timestamp?: Timestamp;
    }) {
        this.id = data.id;
        this.userId = data.userId;
        this.movieId = data.movieId;
        this.watched = data.watched || null;
        this.interest = data.interest || null;
        this.rewatch = data.rewatch || null;
        this.timestamp = data.timestamp;
    }
}