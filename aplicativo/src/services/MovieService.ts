// aplicativo/src/services/MovieService.ts
import { Movie, MovieStatus } from '../models/Movie';
import { getMovieDetails } from '../api/tmdb'; // Importe a função existente da API

// Simulação de banco de dados em memória
let localMovies: Movie[] = [
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/6pJB2t3MbQUy9m5pFIBHXLqnqNd.jpg", status: "like2", isExternal: false, isTmdb: true },
];

export class MovieService { 
  private static instance: MovieService;

  private constructor() {}

  public static getInstance(): MovieService {
    if (!MovieService.instance) {
      MovieService.instance = new MovieService();
    }
    return MovieService.instance;
  }

  // Adiciona um filme ao cache local se não existir
  addMovieToLocalStore(movie: Movie): void {
    const movieExists = localMovies.some(m => m.id === movie.id);
    if (!movieExists) {
      localMovies.push(movie);
    }
  }

  // Obtém um filme por ID (do cache ou da API)
  async getMovieById(id: string): Promise<Movie | undefined> {
    let movie = localMovies.find(m => m.id === id);
    if (movie) {
      return movie;
    }

    const tmdbMovieData = await getMovieDetails(id);
    if (tmdbMovieData) {
      const tmdbMovie = new Movie(tmdbMovieData); // Cria uma instância da classe Movie
      this.addMovieToLocalStore(tmdbMovie);
      return tmdbMovie;
    }
    return undefined;
  }

  // Adiciona um filme externo (criado manualmente)
  addExternalMovie(movieData: {
    title: string;
    releaseYear?: string;
    director?: string;
    duration?: string;
    genre?: string;
    posterUrl: string | null;
    status?: MovieStatus;
  }): void {
    const newId = `external-${Date.now()}`;
    const newMovie = new Movie({ ...movieData, id: newId, isExternal: true, isTmdb: false });
    localMovies.push(newMovie);
  }

  // Atualiza um filme existente
  updateMovie(updatedMovie: Movie): void {
    const index = localMovies.findIndex(m => m.id === updatedMovie.id);
    if (index !== -1) {
      localMovies[index] = updatedMovie;
    }
  }

  // Deleta um filme
  deleteMovie(movieId: string): void {
    localMovies = localMovies.filter(movie => movie.id !== movieId);
    // TODO: Remover de playlists e avaliações associadas
  }

  // Filtra e retorna filmes baseados no tipo e status de avaliação
  getFilteredAndRatedMovies(filterType: 'all' | 'external' | 'app_db' = 'all'): Movie[] {
    let filteredBySource: Movie[] = [];

    switch (filterType) {
      case 'all':
        filteredBySource = localMovies;
        break;
      case 'external':
        filteredBySource = localMovies.filter(movie => movie.isExternal === true);
        break;
      case 'app_db':
        filteredBySource = localMovies.filter(movie => movie.isTmdb === true);
        break;
      default:
        filteredBySource = localMovies;
        break;
    }
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
  }

  getAllMovies(): Movie[] {
    return [...localMovies];
  }
}