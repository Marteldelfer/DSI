// aplicativo/src/services/PlaylistService.ts
import { Playlist } from '../models/Playlist';
import { Movie } from '../models/Movie'; // CORREÇÃO: Adicione esta linha
import { MovieService } from './MovieService';

let localPlaylists: Playlist[] = [
  // Exemplo de playlist inicial (se precisar, certifique-se de que o Movie com id "100" exista em MovieService)
  new Playlist({ id: "p1", name: "Minhas Favoritas", movieIds: ["100"], coverImageUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/6pJB2t3MbQUy9m5pFIBHXLqnqNd.jpg" }),
];

export class PlaylistService {
  private static instance: PlaylistService;
  private movieService: MovieService;

  private constructor() {
    this.movieService = MovieService.getInstance();
  }

  public static getInstance(): PlaylistService {
    if (!PlaylistService.instance) {
      PlaylistService.instance = new PlaylistService();
    }
    return PlaylistService.instance;
  }

  getPlaylists(): Playlist[] {
    return [...localPlaylists];
  }

  addPlaylist(playlistName: string, movieIds: string[] = [], coverImageUrl: string | null = null): Playlist {
    const newPlaylist = new Playlist({ name: playlistName, movieIds, coverImageUrl });
    localPlaylists.push(newPlaylist);
    return newPlaylist;
  }

  updatePlaylist(updatedPlaylist: Playlist): void {
    localPlaylists = localPlaylists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p);
  }

  deletePlaylist(playlistId: string): void {
    localPlaylists = localPlaylists.filter(p => p.id !== playlistId);
  }

  getPlaylistById(id: string): Playlist | undefined {
    return localPlaylists.find(p => p.id === id);
  }

  // Retorna os filmes de uma playlist
  getMoviesInPlaylist(playlistId: string): Movie[] {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return [];
    return playlist.movieIds
      .map(movieId => this.movieService.getAllMovies().find(m => m.id === movieId))
      .filter((movie): movie is Movie => movie !== undefined);
  }
}