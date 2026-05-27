// aplicativo/src/models/DiarioCinema.ts
export class DiarioCinema {
    id: string;
    cinemaName: string;
    movieTitle: string | null;
    data: string; // DD/MM/AAAA
    fotos: string[]; // URLs das fotos no Supabase
    observacoes: string | null;
    timestamp: string;

    constructor(data: {
        id?: string;
        cinemaName: string;
        movieTitle?: string | null;
        data: string;
        fotos?: string[];
        observacoes?: string | null;
        timestamp?: string;
    }) {
        this.id = data.id || '';
        this.cinemaName = data.cinemaName;
        this.movieTitle = data.movieTitle ?? null;
        this.data = data.data;
        this.fotos = data.fotos ?? [];
        this.observacoes = data.observacoes ?? null;
        this.timestamp = data.timestamp || new Date().toISOString();
    }
}
