import Constants from 'expo-constants';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // w500 é uma largura comum para pôsteres

// Certifique-se de que a chave da API está configurada no app.json
const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbApiKey as string;

// Interface para um filme retornado pela API do TMDB (simplificada)
export interface TMDBMovie {
  id: number; // TMDB usa 'id' como número
  title: string;
  poster_path: string | null; // Caminho relativo do pôster
  vote_average: number; // Nota média
  release_date: string; // Data de lançamento
  overview: string; // Sinopse
  genre_ids: number[]; // IDs dos gêneros
  // Adicione outros campos que você precisar
}

// Interface para a resposta da API do TMDB para listas de filmes
interface TMDBMovieListResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// Função genérica para fazer requisições à API do TMDB
async function fetchTmdb<T>(endpoint: string, params: URLSearchParams = new URLSearchParams()): Promise<T | null> {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key não configurada. Verifique seu app.json.");
    return null;
  }

  params.append('api_key', TMDB_API_KEY);
  params.append('language', 'pt-BR'); // Opcional: para obter resultados em português

  const url = `${TMDB_BASE_URL}${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Erro na requisição TMDB para ${endpoint}:`, response.status, errorData);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados do TMDB para ${endpoint}:`, error);
    return null;
  }
}

// Função para buscar filmes populares
export async function getPopularMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTmdb<TMDBMovieListResponse>('/movie/popular');
  return data?.results || [];
}

// Função para buscar filmes por termo de pesquisa
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const params = new URLSearchParams();
  params.append('query', query);
  const data = await fetchTmdb<TMDBMovieListResponse>('/search/movie', params);
  return data?.results || [];
}

// Função para obter detalhes de um filme específico
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    const data = await fetchTmdb<TMDBMovie>(`/movie/${movieId}`);
    return data;
}


// Exporta a URL base para construir URLs de pôsteres
export { TMDB_IMAGE_BASE_URL };