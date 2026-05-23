// aplicativo/src/models/Playlist.ts
import { Movie } from './Movie';

export class Playlist {
    id: string; 
    userId: string;
    name: string;
    description: string | null; // ALTERADO: Agora aceita string ou null
    movieIds: string[];
    timestamp?: string; 

    constructor(data: { id?: string; userId: string; name: string; description?: string | null; movieIds?: string[]; timestamp?: string }) { // ALTERADO: description pode ser string | null
        this.id = data.id || ''; 
        this.userId = data.userId;
        this.name = data.name;
        this.description = data.description ?? null; // Usar ?? null para garantir que undefined vire null
        this.movieIds = data.movieIds || [];
        this.timestamp = data.timestamp;
    }
}