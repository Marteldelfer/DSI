<<<<<<< Updated upstream
// NOVO CONTEÚDO PARA: aplicativo/utils/mockData.ts
=======
// SUBSTITUA O CONTEÚDO DE: aplicativo/utils/mockData.ts

import { getMovieDetails } from "@/src/api/tmdb";
>>>>>>> Stashed changes

// Tipo para o status de avaliação do filme
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

<<<<<<< Updated upstream
// Interface para um filme avaliado pelo usuário
=======
// Interface para um filme (atualizada)
>>>>>>> Stashed changes
export interface Movie {
  id: string; // ID único gerado pelo app (pode ser o TMDB ID ou um ID interno)
  title: string;
  posterUrl: string | null; // URL completo do pôster (pode vir do TMDB ou ser nulo para externos)
  releaseYear?: string;
  director?: string;
  duration?: string; // Duração em minutos, como string
  genre?: string;
<<<<<<< Updated upstream
  status: MovieStatus; // OBRIGATÓRIO para filmes avaliados
  isExternal: boolean; // True se for um filme adicionado manualmente e não do TMDB
  tmdbId?: number; // Opcional: o ID do TMDB, se o filme for do TMDB
=======
  overview?: string; // Campo adicionado para sinopse do TMDB
  status?: MovieStatus; // Campo de status de avaliação do usuário
  isExternal?: boolean; // Identifica filmes adicionados manualmente
  isTmdb?: boolean; // Identifica filmes vindos do TMDB
>>>>>>> Stashed changes
}

// Interface para uma playlist (sem alterações significativas)
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

<<<<<<< Updated upstream
// Mock dos filmes avaliados pelo usuário.
// Agora, os filmes do TMDB que foram "avaliados" terão um tmdbId e posterUrl completo.
// Filmes isExternal = true NÃO terão tmdbId.
export let mockMovies: Movie[] = [
  { id: "100", tmdbId: 100, title: "Lock, Stock and Two Smoking Barrels", posterUrl: "https://image.tmdb.org/t/p/w500/A0H8A2L4k0j7Y7k9q8J6r0b3g.jpg", status: "like2", isExternal: false },
  { id: "101", tmdbId: 101, title: "Léon: The Professional", posterUrl: "https://image.tmdb.org/t/p/w500/eNPWlP6pDqM8qR2p4b5J0v5o3a.jpg", status: "dislike2", isExternal: false },
  { id: "102", tmdbId: 102, title: "Open Hearts", posterUrl: "https://image.tmdb.org/t/p/w500/kY8p2k5s3r9i4t3i4t3i4t3i4t3i.jpg", status: "staro", isExternal: false },
  // Exemplo de filme externo adicionado manualmente
  { 
    id: "external-1", 
    title: "Meu Filme Favorito (Local)", 
    posterUrl: null, 
    releaseYear: "2023", 
    director: "Eu Mesmo", 
    duration: "120 min", 
    genre: "Drama", 
    status: "like2", 
    isExternal: true 
  },
];

// Armazenamento em memória das playlists (sem alterações por enquanto)
let mockPlaylists: Playlist[] = [
  { id: "p1", name: "Minhas Favoritas", movieIds: ["100", "external-1"], coverImageUrl: mockMovies.find(m => m.id === "100")?.posterUrl },
  { id: "p2", name: "Ação e Aventura", movieIds: ["101"], coverImageUrl: mockMovies.find(m => m.id === "101")?.posterUrl },
=======
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
>>>>>>> Stashed changes
];

// Funções CRUD para as playlists
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

<<<<<<< Updated upstream
// Funções CRUD para Filmes Avaliados (incluindo filmes externos)
export function getMovieById(id: string): Movie | undefined {
    return mockMovies.find(movie => movie.id === id);
}

// Função para adicionar um filme (seja do TMDB ou externo) que o usuário avaliou
export function addOrUpdateRatedMovie(movie: Movie): void {
    const existingIndex = mockMovies.findIndex(m => m.id === movie.id);
    if (existingIndex !== -1) {
        // Atualiza filme existente
        const originalMovie = mockMovies[existingIndex];
        mockMovies[existingIndex] = {
            ...originalMovie,
            ...movie,
            isExternal: movie.isExternal // Mantenha o status original de isExternal
=======
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
>>>>>>> Stashed changes
        };
    } else {
        // Adiciona novo filme
        mockMovies.push(movie);
    }
<<<<<<< Updated upstream
    console.log("Filme avaliado adicionado/atualizado (mock):", movie);
=======
>>>>>>> Stashed changes
}

export function deleteMovie(movieId: string): void {
    mockMovies = mockMovies.filter(movie => movie.id !== movieId);
    // Remove o filme de quaisquer playlists
    mockPlaylists = mockPlaylists.map(playlist => ({
        ...playlist,
        movieIds: playlist.movieIds.filter(id => id !== movieId),
    }));
<<<<<<< Updated upstream
    console.log("Filme excluído (mock):", movieId, "Removido de playlists.");
}

// Tipos de filtro para a tela MeusFilmes
=======
}

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            // Filmes do "banco de dados do app" são aqueles que vieram do TMDB e foram avaliados
            filteredBySource = mockMovies.filter(movie => movie.isExternal === false);
=======
            // Filmes do "banco de dados do app" agora são os do TMDB
            filteredBySource = mockMovies.filter(movie => movie.isTmdb === true);
>>>>>>> Stashed changes
            break;
        default:
            filteredBySource = mockMovies;
            break;
    }
<<<<<<< Updated upstream
    // Agora filtra apenas os filmes que têm um status de avaliação
    // (todos os filmes em mockMovies já deveriam ter status, mas é uma verificação extra)
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
=======
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
>>>>>>> Stashed changes
}