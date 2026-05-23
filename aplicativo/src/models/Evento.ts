// aplicativo/src/models/Evento.ts
export class Evento {
    id: string;
    cinemaName: string;
    cinemaLat: number;
    cinemaLon: number;
    movieId: string | null;
    movieTitle: string | null;
    dataHora: string; // Formato ISO 8601
    notas: string | null;
    timestamp?: string;

    constructor(data: {
        id?: string;
        cinemaName: string;
        cinemaLat: number;
        cinemaLon: number;
        movieId?: string | null;
        movieTitle?: string | null;
        dataHora: string;
        notas?: string | null;
        timestamp?: string;
    }) {
        this.id = data.id || '';
        this.cinemaName = data.cinemaName;
        this.cinemaLat = data.cinemaLat;
        this.cinemaLon = data.cinemaLon;
        this.movieId = data.movieId ?? null;
        this.movieTitle = data.movieTitle ?? null;
        this.dataHora = data.dataHora;
        this.notas = data.notas ?? null;
        this.timestamp = data.timestamp;
    }
}
