// aplicativo/src/models/Movie.ts
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

export class Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear?: string;
  director?: string;
  duration?: string;
  genre?: string;
  overview?: string;
  status?: MovieStatus;
  isExternal?: boolean;
  isTmdb?: boolean;
  tmdbId?: number; // Adicionando o campo que faltava na sua versão original

  constructor(data: Partial<Movie>) {
    this.id = data.id || '';
    this.tmdbId = data.tmdbId;
    this.title = data.title || 'Título Desconhecido';
    this.posterUrl = data.posterUrl || null;
    this.releaseYear = data.releaseYear;
    this.director = data.director;
    this.duration = data.duration;
    this.genre = data.genre;
    this.overview = data.overview;
    this.status = data.status || null;
    this.isExternal = data.isExternal || false;
    this.isTmdb = data.isTmdb || false;
  }
}