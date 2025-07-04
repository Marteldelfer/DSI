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

  constructor(data: {
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
  }) {
    this.id = data.id;
    this.title = data.title;
    this.posterUrl = data.posterUrl;
    this.releaseYear = data.releaseYear;
    this.director = data.director;
    this.duration = data.duration;
    this.genre = data.genre;
    this.overview = data.overview;
    this.status = data.status;
    this.isExternal = data.isExternal;
    this.isTmdb = data.isTmdb;
  }

  // Exemplo de método da classe Movie
  getDisplayTitle(): string {
    return `${this.title}${this.releaseYear ? ` (${this.releaseYear})` : ''}`;
  }

  // Método para simular a obtenção de detalhes mais aprofundados (ex: de uma API)
  async fetchDetails(): Promise<void> {
    // Simulação: Em uma aplicação real, você chamaria a API do TMDB aqui
    // const tmdbDetails = await getMovieDetails(this.id);
    // if (tmdbDetails) {
    //   this.director = tmdbDetails.director;
    //   this.duration = tmdbDetails.duration;
    //   this.genre = tmdbDetails.genre;
    //   this.overview = tmdbDetails.overview;
    // }
    console.log(`Fetching details for movie: ${this.title}`);
  }
}