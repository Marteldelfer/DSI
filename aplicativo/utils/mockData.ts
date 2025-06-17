// NOVO CONTEÚDO PARA: aplicativo/utils/mockData.ts

// Tipo para o status de avaliação do filme
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

// Interface para um filme avaliado pelo usuário
export interface Movie {
  id: string; // ID único gerado pelo app (pode ser o TMDB ID ou um ID interno)
  title: string;
  posterUrl: string | null; // URL completo do pôster (pode vir do TMDB ou ser nulo para externos)
  releaseYear?: string;
  director?: string;
  duration?: string; // Duração em minutos, como string
  genre?: string;
  status: MovieStatus; // OBRIGATÓRIO para filmes avaliados
  isExternal: boolean; // True se for um filme adicionado manualmente e não do TMDB
  tmdbId?: number; // Opcional: o ID do TMDB, se o filme for do TMDB
}

// Interface para uma playlist (sem alterações significativas)
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

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
        };
    } else {
        // Adiciona novo filme
        mockMovies.push(movie);
    }
    console.log("Filme avaliado adicionado/atualizado (mock):", movie);
}

export function deleteMovie(movieId: string): void {
    mockMovies = mockMovies.filter(movie => movie.id !== movieId);
    // Também remova o filme de quaisquer playlists
    mockPlaylists = mockPlaylists.map(playlist => ({
        ...playlist,
        movieIds: playlist.movieIds.filter(id => id !== movieId),
    }));
    console.log("Filme excluído (mock):", movieId, "Removido de playlists.");
}

// Tipos de filtro para a tela MeusFilmes
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
            // Filmes do "banco de dados do app" são aqueles que vieram do TMDB e foram avaliados
            filteredBySource = mockMovies.filter(movie => movie.isExternal === false);
            break;
        default:
            filteredBySource = mockMovies;
            break;
    }
    // Agora filtra apenas os filmes que têm um status de avaliação
    // (todos os filmes em mockMovies já deveriam ter status, mas é uma verificação extra)
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
}