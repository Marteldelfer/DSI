// aplicativo/src/api/tmdb.ts

import axios from 'axios';
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

let genresMap: { [id: number]: string } = {};

const fetchGenres = async () => {
  if (Object.keys(genresMap).length > 0) return;
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    response.data.genres.forEach((genre: { id: number; name: string }) => {
      genresMap[genre.id] = genre.name;
    });
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
  }
};

fetchGenres();

const transformApiMovieToLocalMovie = (apiMovie: any): Movie => {
  const director = 'Não informado'; 
  const genreNames = apiMovie.genres
    ? apiMovie.genres.map((g: any) => g.name).join(', ')
    : (apiMovie.genre_ids
      ? apiMovie.genre_ids.map((id: number) => genresMap[id]).filter(Boolean).join(', ')
      : 'Não informado');

  return new Movie({
    id: apiMovie.id.toString(),
    title: apiMovie.title,
    posterUrl: apiMovie.poster_path ? `${IMAGE_BASE_URL}${apiMovie.poster_path}` : null,
    releaseYear: apiMovie.release_date ? apiMovie.release_date.substring(0, 4) : undefined,
    director: director,
    duration: apiMovie.runtime ? apiMovie.runtime.toString() : undefined,
    genre: genreNames,
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

// --- FUNÇÃO ADICIONADA AQUI ---
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
    const response = await tmdbApi.get(`/movie/${movieId}`); 
    return transformApiMovieToLocalMovie(response.data);
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};