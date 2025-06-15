// aplicativo/utils/mockData.ts

// Interface para um filme (agora exportada)
export interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
}

// Interface para uma playlist (agora exportada)
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

// Mock dos filmes
export const mockMovies: Movie[] = [
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "https://image.tmdb.org/t/p/w500/A0H8A2L4k0j7Y7k9q8J6r0b3g.jpg" },
  { id: "101", title: "Léon: The Professional", posterUrl: "https://image.tmdb.org/t/p/w500/eNPWlP6pDqM8qR2p4b5J0v5o3a.jpg" },
  { id: "102", title: "Open Hearts", posterUrl: "https://image.tmdb.org/t/p/w500/kY8p2k5s3r9i4t3i4t3i4t3i4t3i.jpg" },
  { id: "103", title: "Taxi Driver", posterUrl: "https://image.tmdb.org/t/p/w500/h2m8L5wX3n4m8n3m8n3m8n3m8n3m.jpg" },
  { id: "104", title: "Run Lola Run", posterUrl: "https://image.tmdb.org/t/p/w500/qX4r9aQ0x4r9aQ0x4r9aQ0x4r9aQ.jpg" },
  { id: "105", title: "Back to the Future", posterUrl: "https://image.tmdb.org/t/p/w500/sT00g5WqA4f3S02R3o2e3rG9k.jpg" },
  { id: "106", title: "Predator", posterUrl: "https://image.tmdb.org/t/p/w500/yQd4iF8L1jJ4Xw1g4u1d0N4S7J8.jpg" },
  { id: "107", title: "Snatch", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2Qjlnef7AM2rtPr49V19A1dL.jpg" },
  { id: "108", title: "Three Colors: Blue", posterUrl: "https://image.tmdb.org/t/p/w500/dKqg3QyRk3p6Z2aV6q8S4K1a.jpg" },
  { id: "109", title: "Three Colors: White", posterUrl: "https://image.tmdb.org/t/p/w500/1X6DqT5gVj2O2U9d6eQ6tW1s8Fk.jpg" },
];

// Armazenamento em memória das playlists
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