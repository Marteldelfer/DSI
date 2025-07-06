// aplicativo/src/services/PlaylistService.ts
import { Playlist } from '../models/Playlist';
import { Movie } from '../models/Movie';
import { MovieService } from './MovieService';

let localPlaylists: Playlist[] = [];

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

  createPlaylist(name: string, movieIds: string[], coverImageUrl: string | null = null): Playlist {
    const newPlaylist = new Playlist({ name, movieIds, coverImageUrl });
    localPlaylists.push(newPlaylist);
    return newPlaylist;
  }

  updatePlaylist(updatedPlaylist: Playlist): void {
    const index = localPlaylists.findIndex(p => p.id === updatedPlaylist.id);
    if (index !== -1) {
      localPlaylists[index] = updatedPlaylist;
    }
  }

  deletePlaylist(playlistId: string): void {
    localPlaylists = localPlaylists.filter(p => p.id !== playlistId);
  }

  getPlaylistById(id: string): Playlist | undefined {
    return localPlaylists.find(p => p.id === id);
  }

  addMoviesToPlaylist(playlistId: string, movieIds: string[]): void {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      movieIds.forEach(movieId => {
        if (!playlist.movieIds.includes(movieId)) {
          playlist.movieIds.push(movieId);
        }
      });
      this.updatePlaylist(playlist);
    }
  }

  // --- LÓGICA DE EXCLUSÃO AUTOMÁTICA ADICIONADA AQUI ---
  // O método agora retorna 'true' se a playlist foi deletada, e 'false' caso contrário.
  removeMovieFromPlaylist(playlistId: string, movieId: string): boolean {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      playlist.movieIds = playlist.movieIds.filter(id => id !== movieId);

      // Se a lista de filmes ficar vazia, exclui a playlist
      if (playlist.movieIds.length === 0) {
        this.deletePlaylist(playlistId);
        return true; // Indica que a playlist foi excluída
      } else {
        // Se não, apenas atualiza
        this.updatePlaylist(playlist);
        return false; // Indica que a playlist foi apenas atualizada
      }
    }
    return false;
  }
  
  getMoviesInPlaylist(playlistId: string): Movie[] {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return [];
    return playlist.movieIds
      .map(movieId => this.movieService.getAllMovies().find(m => m.id === movieId))
      .filter((movie): movie is Movie => movie !== undefined);
  }
}