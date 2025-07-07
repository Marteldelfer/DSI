// aplicativo/src/models/Movie.ts
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

export class Movie {
  id: string;
  title: string;
  overview: string | null; // Alterado para aceitar null
  releaseYear: string | null; // Alterado para aceitar null
  genre: string | null; // Alterado para aceitar null
  duration: number | null; // Alterado para aceitar null
  posterUrl: string | null; // Alterado para aceitar null
  backdropUrl: string | null; // Adicionado e alterado para aceitar null
  director: string | null; // Adicionado e alterado para aceitar null
  status: MovieStatus;
  isTmdb: boolean;
  isExternal: boolean;
  tmdbId: number | null; // Adicionado e alterado para aceitar null

  constructor(data: {
    id: string;
    title: string;
    overview?: string | null;
    releaseYear?: string | null;
    genre?: string | null;
    duration?: number | null;
    posterUrl?: string | null;
    backdropUrl?: string | null; // Incluído aqui
    director?: string | null; // Incluído aqui
    status?: MovieStatus;
    isTmdb?: boolean;
    isExternal?: boolean;
    tmdbId?: number | null; // Incluído aqui
  }) {
    this.id = data.id;
    this.title = data.title;
    this.overview = data.overview ?? null;
    this.releaseYear = data.releaseYear ?? null;
    this.genre = data.genre ?? null;
    this.duration = data.duration ?? null;
    this.posterUrl = data.posterUrl ?? null;
    this.backdropUrl = data.backdropUrl ?? null; // Usar ?? null para Firestore compatibility
    this.director = data.director ?? null; // Usar ?? null
    this.status = data.status ?? null;
    this.isTmdb = data.isTmdb ?? false;
    this.isExternal = data.isExternal ?? false;
    this.tmdbId = data.tmdbId ?? null;
  }
}