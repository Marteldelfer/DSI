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

// Função para transformar a resposta da API na nossa interface Movie
const transformApiMovieToLocalMovie = (apiMovie: any): Movie => {
  return new Movie({ // Instanciar a classe Movie
    id: apiMovie.id.toString(),
    title: apiMovie.title,
    posterUrl: apiMovie.poster_path ? `${IMAGE_BASE_URL}${apiMovie.poster_path}` : null,
    releaseYear: apiMovie.release_date ? apiMovie.release_date.substring(0, 4) : undefined,
    director: 'Não informado', // API de detalhes seria necessária para isso
    duration: apiMovie.runtime ? apiMovie.runtime.toString() : undefined,
    genre: apiMovie.genres ? apiMovie.genres.map((g: any) => g.name).join(', ') : 'Não informado',
    overview: apiMovie.overview,
    status: null, // O status é definido pelo usuário no app
    isExternal: false, // Indica que não é um filme adicionado manualmente
    isTmdb: true, // Nova flag para identificar filmes do TMDB
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
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return transformApiMovieToLocalMovie(response.data);
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};