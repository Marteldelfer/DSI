// SUBSTITUA O CONTEÚDO DE: aplicativo/utils/mockData.ts

import { usuario } from "@/app/validacao/Validacao";
import { getMovieDetails } from "@/src/api/tmdb";

// Tipo para o status de avaliação do filme
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

// Interface para um filme (atualizada)
export interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear?: string;
  director?: string;
  duration?: string; // Duração em minutos, como string
  genre?: string;
  overview?: string; // Campo adicionado para sinopse do TMDB
  status?: MovieStatus; // Campo de status de avaliação do usuário
  isExternal?: boolean; // Identifica filmes adicionados manualmente
  isTmdb?: boolean; // Identifica filmes vindos do TMDB
}

// Interface para uma playlist
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

export interface Avaliacao {
  id?: string;
  movieId: string;
  content?: string;
  review: "like" | "dislike" | "favorite";
}

export interface Comentario {
  id: string;
  avaliacaoId: string;
  content: string;
}

export interface Tags {
  id: string;
  email_usuario: string;
  id_filme: string;
  assistido?: "assistido" | "assistido_old" | "drop" | "nao_assistido";
  interesse?: "sim" | "nao";
  reassistir?: "sim" | "nao";
}

// O mockMovies agora funciona como um cache/banco de dados em memória para
// filmes com os quais o usuário interagiu (avaliados ou adicionados manualmente).
export let mockMovies: Movie[] = [
  // A lista inicial pode ser vazia ou conter filmes pré-definidos que não vêm da API.
  // Mantive um como exemplo, mas agora com a flag isTmdb.
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/6pJB2t3MbQUy9m5pFIBHXLqnqNd.jpg", status: "like2", isExternal: false, isTmdb: true },
];

// Armazenamento em memória das playlists
let mockPlaylists: Playlist[] = [
  { id: "p1", name: "Minhas Favoritas", movieIds: ["100"], coverImageUrl: mockMovies.find(m => m.id === "100")?.posterUrl },
];

// Armazenamento em memória das avaliações
let mockAvaliacoes: Avaliacao[] = [];

// Armazenamento em memória dos comentarios
let mockComentarios: Comentario[] = []

// Armazenamento em memória das tags
let mockTags: Tags[] = []

// Funções CRUD para as playlists (sem alterações)
export function getPlaylists(): Playlist[] {
    return [...mockPlaylists];
}

export function addPlaylist(playlist: Playlist): void {
    mockPlaylists.push(playlist);
}

export function updatePlaylist(updatedPlaylist: Playlist): void {
    mockPlaylists = mockPlaylists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p);
}

export function deletePlaylist(playlistId: string): void {
    mockPlaylists = mockPlaylists.filter(p => p.id !== playlistId);
}

// Funções CRUD para as tags (semelhante ao CRUD de playlists)
export function getAllTags(): Tags[] {
    return [...mockTags];
}

export function addTags(Tags: Tags): void {
    mockTags.push(Tags);
}

export function updateTags(updatedTags: Tags): void {
    mockTags = mockTags.map(p => p.id === updatedTags.id ? updatedTags : p);
}

export function deleteTags(TagsId: string): void {
    mockTags = mockTags.filter(p => p.id !== TagsId);
}

export function getTagsbyMovieandUsuario(movie: Movie, user:usuario) {
  return mockTags.filter(tags => tags.id_filme === movie.id && tags.email_usuario === user.email)
} // TO DO conferir se esse usuario é o mesmo usuário do firebase

// --- LÓGICA DE FILMES ATUALIZADA ---

// Adiciona um filme ao nosso "banco de dados" local se ele não existir.
// Essencial para quando o usuário avalia um filme do TMDB pela primeira vez.
export const addMovieToLocalStore = (movie: Movie) => {
  const movieExists = mockMovies.some(m => m.id === movie.id);
  if (!movieExists) {
    mockMovies.push(movie);
  }
};


// Função para obter um filme. Primeiro busca localmente, se não encontrar, busca na API do TMDB.
export async function getMovieById(id: string): Promise<Movie | undefined> {
  let movie = mockMovies.find(movie => movie.id === id);
  if (movie) {
    return movie;
  }
  
  // Se não encontrou localmente, busca na API do TMDB
  const tmdbMovie = await getMovieDetails(id);
  if (tmdbMovie) {
    addMovieToLocalStore(tmdbMovie); // Adiciona ao nosso "cache" local
    return tmdbMovie;
  }

  return undefined;
}

export function addExternalMovie(movie: Movie): void {
    // Garante que as flags corretas sejam definidas para filmes externos
    mockMovies.push({ ...movie, isExternal: true, isTmdb: false });
}

export function updateMovie(updatedMovie: Movie): void {
    const index = mockMovies.findIndex(m => m.id === updatedMovie.id);
    if (index !== -1) {
        const originalMovie = mockMovies[index];
        mockMovies[index] = {
            ...originalMovie,
            ...updatedMovie,
        };
    }
}

export function deleteMovie(movieId: string): void {
    mockMovies = mockMovies.filter(movie => movie.id !== movieId);
    // Remove o filme de quaisquer playlists
    mockPlaylists = mockPlaylists.map(playlist => ({
        ...playlist,
        movieIds: playlist.movieIds.filter(id => id !== movieId),
    }));
}

export type MovieFilterType = 'all' | 'external' | 'app_db';

export function getFilteredAndRatedMovies(filterType: MovieFilterType = 'all'): Movie[] {
    let filteredBySource: Movie[] = [];

    switch (filterType) {
        case 'all':
            filteredBySource = mockMovies;
            break;
        case 'external':
            filteredBySource = mockMovies.filter(movie => movie.isExternal === true);
            break;
        case 'app_db':
            // Filmes do "banco de dados do app" agora são os do TMDB
            filteredBySource = mockMovies.filter(movie => movie.isTmdb === true);
            break;
        default:
            filteredBySource = mockMovies;
            break;
    }
    // Retorna apenas os filmes que têm um status de avaliação
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
}

// --- LÓGICA DE AVALIAÇÕES ATUALIZADA ---

export function getAvaliacoes() {
  return [...mockAvaliacoes];
}

// ATUALIZADO: Agora também atualiza o status do filme em mockMovies
export function createAvaliacao(avaliacao: Avaliacao): void {
  // Adiciona a avaliação
  if (mockAvaliacoes.length > 0) {
    avaliacao.id = (parseInt(mockAvaliacoes[mockAvaliacoes.length - 1].id ?? '0') + 1).toString();
  } else {
    avaliacao.id = "0"
  }
  mockAvaliacoes.push(avaliacao);

  // Atualiza o status do filme correspondente em mockMovies
  const movieIndex = mockMovies.findIndex(m => m.id === avaliacao.movieId);
  if (movieIndex > -1) {
    let status: MovieStatus = null;
    if (avaliacao.review === 'like') status = 'like2';
    if (avaliacao.review === 'dislike') status = 'dislike2';
    if (avaliacao.review === 'favorite') status = 'staro';
    mockMovies[movieIndex].status = status;
  }
}

export function getAvaliacaoById(id: string): Avaliacao | undefined {
  return mockAvaliacoes.find(a => a.id === id);
}

export function getAvaliacoesByMovieId(movieId: string) {
  return mockAvaliacoes.filter(avaliacao => avaliacao.movieId === movieId)
}


// CRUD Comentario (sem alterações)
export function getComentariosByAvaliacaoId(avaliacaoId: string): Comentario[] {
  return mockComentarios.filter(c => c.avaliacaoId === avaliacaoId);
}

export function createComentario(avaliacaoId: string, content: string) {
  let index = "0"
  if (mockComentarios.length > 0) {
    index = (parseInt(mockComentarios[mockComentarios.length - 1].id) + 1).toString();
  }
  mockComentarios.push({id: index, avaliacaoId: avaliacaoId, content: content})
}