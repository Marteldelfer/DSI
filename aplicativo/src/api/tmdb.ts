// aplicativo/src/api/tmdb.ts

import axios from 'axios';
// CORREÇÃO: Importar a classe Movie da nova localização
import { Movie } from '../models/Movie'; 

const API_KEY = '61c4b858abcb463f369ef0aa3ab2cd31';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbApi = axios.create({
  baseURL: API_BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'pt-BR',
  },
});

// NOVO: Cache para os nomes dos gêneros (id -> nome) para que o gênero apareça
let genresMap: { [id: number]: string } = {};

// NOVO: Função para buscar a lista completa de gêneros do TMDB (será chamada uma vez)
const fetchGenres = async () => {
  if (Object.keys(genresMap).length > 0) return; // Se já buscou, não precisa buscar de novo
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    response.data.genres.forEach((genre: { id: number; name: string }) => {
      genresMap[genre.id] = genre.name;
    });
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
  }
};

// NOVO: Chamar a função para buscar os gêneros quando o módulo é carregado
fetchGenres();

// Função para transformar a resposta da API na nossa classe Movie
const transformApiMovieToLocalMovie = (apiMovie: any): Movie => {
  // Diretor volta a ser "Não informado" (hardcoded), pois não buscaremos os 'credits'
  const director = 'Não informado'; 

  // Lógica para gêneros: Usa 'genres' array de detalhes, ou mapeia 'genre_ids' de popular/search
  const genreNames = apiMovie.genres // Verifica se veio o array completo de gêneros (do endpoint de detalhes)
    ? apiMovie.genres.map((g: any) => g.name).join(', ')
    : (apiMovie.genre_ids // Se não, verifica se veio a lista de IDs (do endpoint de popular/search)
      ? apiMovie.genre_ids.map((id: number) => genresMap[id]).filter(Boolean).join(', ') // Usa o cache de gêneros
      : 'Não informado');

  return new Movie({ // Instanciar a classe Movie
    id: apiMovie.id.toString(),
    title: apiMovie.title,
    posterUrl: apiMovie.poster_path ? `${IMAGE_BASE_URL}${apiMovie.poster_path}` : null,
    releaseYear: apiMovie.release_date ? apiMovie.release_date.substring(0, 4) : undefined,
    director: director, // Agora é "Não informado" novamente
    duration: apiMovie.runtime ? apiMovie.runtime.toString() : undefined, // Duração depende se 'runtime' está presente na resposta
    genre: genreNames, // Gênero continua sendo puxado
    overview: apiMovie.overview,
    status: null,
    isExternal: false,
    isTmdb: true,
  });
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/popular');
    return response.data.results.map(transformApiMovieToLocalMovie);
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query },
    });
    return response.data.results.map(transformApiMovieToLocalMovie);
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId: string): Promise<Movie | null> => {
  try {
    // REVERTIDO: Não usa append_to_response para 'credits'
    const response = await tmdbApi.get(`/movie/${movieId}`); 
    return transformApiMovieToLocalMovie(response.data);
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};