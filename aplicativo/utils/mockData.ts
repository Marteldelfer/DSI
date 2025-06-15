// aplicativo/utils/mockData.ts

// Tipo para o status de avaliação do filme
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

// Interface para um filme
export interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear?: string;
  director?: string;
  duration?: string; // Duração em minutos, como string
  genre?: string;
  status?: MovieStatus; // Adicionando campo de status opcional
  isExternal?: boolean; // Novo campo para identificar filmes externos
}

// Interface para uma playlist
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

// Mock dos filmes existentes
// **MUDANÇA AQUI: de 'const' para 'let'**
export let mockMovies: Movie[] = [
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "https://image.tmdb.org/t/p/w500/A0H8A2L4k0j7Y7k9q8J6r0b3g.jpg", status: "like2", isExternal: false },
  { id: "101", title: "Léon: The Professional", posterUrl: "https://image.tmdb.org/t/p/w500/eNPWlP6pDqM8qR2p4b5J0v5o3a.jpg", status: "dislike2", isExternal: false },
  { id: "102", title: "Open Hearts", posterUrl: "https://image.tmdb.org/t/p/w500/kY8p2k5s3r9i4t3i4t3i4t3i4t3i.jpg", status: "staro", isExternal: false },
  { id: "103", title: "Taxi Driver", posterUrl: "https://image.tmdb.org/t/p/w500/h2m8L5wX3n4m8n3m8n3m8n3m8n3m.jpg", isExternal: false },
  { id: "104", title: "Run Lola Run", posterUrl: "https://image.tmdb.org/t/p/w500/qX4r9aQ0x4r9aQ0x4r9aQ0x4r9aQ.jpg", isExternal: false },
  { id: "105", title: "Back to the Future", posterUrl: "https://image.tmdb.org/t/p/w500/sT00g5WqA4f3S02R3o2e3rG9k.jpg", isExternal: false },
  { id: "106", title: "Predator", posterUrl: "https://image.tmdb.org/t/p/w500/yQd4iF8L1jJ4Xw1g4u1d0N4S7J8.jpg", isExternal: false },
  { id: "107", title: "Snatch", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2Qjlnef7AM2rtPr49V19A1dL.jpg", isExternal: false },
  { id: "108", title: "Three Colors: Blue", posterUrl: "https://image.tmdb.org/t/p/w500/dKqg3QyRk3p6Z2aV6q8S4K1a.jpg", isExternal: false },
  { id: "109", title: "Three Colors: White", posterUrl: "https://image.tmdb.org/t/p/w500/1X6DqT5gVj2O2U9d6eQ6tW1s8Fk.jpg", isExternal: false },
];

// Armazenamento em memória das playlists (sem alterações)
let mockPlaylists: Playlist[] = [
  { id: "p1", name: "Minhas Favoritas", movieIds: ["100", "103"], coverImageUrl: mockMovies.find(m => m.id === "100")?.posterUrl },
  { id: "p2", name: "Ação e Aventura", movieIds: ["101", "105"], coverImageUrl: mockMovies.find(m => m.id === "101")?.posterUrl },
];

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

// Funções CRUD para Filmes (incluindo filmes externos)
export function getMovieById(id: string): Movie | undefined {
    return mockMovies.find(movie => movie.id === id);
}

export function addExternalMovie(movie: Movie): void {
    // Garante que isExternal seja true para filmes adicionados externamente
    mockMovies.push({ ...movie, isExternal: true });
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para salvar no Firestore aqui.
    console.log("Filme externo adicionado (mock):", movie);
}

export function updateMovie(updatedMovie: Movie): void {
    const index = mockMovies.findIndex(m => m.id === updatedMovie.id);
    if (index !== -1) {
        // Mantém a propriedade isExternal original se não for fornecida na atualização
        const originalMovie = mockMovies[index];
        mockMovies[index] = {
            ...originalMovie, // Mantém propriedades existentes
            ...updatedMovie, // Sobrescreve com as atualizadas
            isExternal: originalMovie.isExternal || updatedMovie.isExternal || false // Garante que isExternal seja mantido ou definido
        };
    }
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para atualizar no Firestore aqui.
    console.log("Filme atualizado (mock):", updatedMovie);
}

export function deleteMovie(movieId: string): void {
    mockMovies = mockMovies.filter(movie => movie.id !== movieId);
    // Também remova o filme de quaisquer playlists
    mockPlaylists = mockPlaylists.map(playlist => ({
        ...playlist,
        movieIds: playlist.movieIds.filter(id => id !== movieId),
    }));
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para deletar no Firestore aqui.
    console.log("Filme excluído (mock):", movieId, "Removido de playlists.");
}

// Função para obter filmes com base no filtro e status de avaliação
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
            // Filmes do "banco de dados do app" são aqueles que não são externos
            filteredBySource = mockMovies.filter(movie => movie.isExternal === false || movie.isExternal === undefined);
            break;
        default:
            filteredBySource = mockMovies;
            break;
    }
    // Agora filtra apenas os filmes que têm um status de avaliação
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
}