// aplicativo/src/services/MovieService.ts
import { Movie, MovieStatus } from '../models/Movie';
import { getMovieDetails } from '../api/tmdb';

let localMovies: Movie[] = [];

export class MovieService { 
  private static instance: MovieService;
  private constructor() {}

  public static getInstance(): MovieService {
    if (!MovieService.instance) {
      MovieService.instance = new MovieService();
    }
    return MovieService.instance;
  }

  // Função robusta para adicionar ou atualizar um filme
  addMovieToLocalStore(movie: Movie): Movie {
    const existingIndex = localMovies.findIndex(m => m.id === movie.id);

    if (existingIndex > -1) {
      // Se já existe, mescla os dados para não perder informações como o 'status'
      const existingMovie = localMovies[existingIndex];
      localMovies[existingIndex] = new Movie({
        ...existingMovie, // Base são os dados que já temos
        ...movie,       // Sobrescreve com os dados mais novos (ex: da API)
        status: existingMovie.status, // Garante que o status da avaliação nunca se perca
      });
      return localMovies[existingIndex];
    } else {
      localMovies.push(movie);
      return movie;
    }
  }

  async getMovieById(id: string): Promise<Movie | undefined> {
    let movie = localMovies.find(m => m.id === id);

    // Busca da API para garantir dados atualizados, mas só se não tivermos os detalhes completos
    if (!movie || !movie.director) {
        const tmdbMovieData = await getMovieDetails(id);
        if (tmdbMovieData) {
            // Usa a nova função robusta para mesclar os dados
            movie = this.addMovieToLocalStore(tmdbMovieData);
        }
    }
    return movie;
  }

  addExternalMovie(movieData: Partial<Movie>): Movie {
    const newMovie = new Movie({ ...movieData, id: `external-${Date.now()}`, isExternal: true, isTmdb: false });
    return this.addMovieToLocalStore(newMovie);
  }

  updateMovie(updatedMovie: Movie): void {
    this.addMovieToLocalStore(updatedMovie);
  }

  getFilteredAndRatedMovies(
    filterType: 'all' | 'external' | 'app_db' = 'all',
    statusFilter: MovieStatus | 'all' = 'all'
  ): Movie[] {
    const ratedMovies = localMovies.filter(movie => movie.status !== null);
    
    let filteredBySource: Movie[];
    switch (filterType) {
      case 'external':
        filteredBySource = ratedMovies.filter(movie => movie.isExternal);
        break;
      case 'app_db':
        filteredBySource = ratedMovies.filter(movie => movie.isTmdb);
        break;
      default:
        filteredBySource = ratedMovies;
        break;
    }

    if (statusFilter !== 'all') {
      return filteredBySource.filter(movie => movie.status === statusFilter);
    }
    
    return filteredBySource;
  }

  getAllMovies(): Movie[] {
    return [...localMovies];
  }
}