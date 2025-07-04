// aplicativo/src/models/Playlist.ts
export class Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
  // userId: string; // Adicionar se necessário

  constructor(data: { id?: string; name: string; movieIds?: string[]; coverImageUrl?: string | null }) {
    this.id = data.id || `pl-${Date.now()}`;
    this.name = data.name;
    this.movieIds = data.movieIds || [];
    this.coverImageUrl = data.coverImageUrl;
  }

  addMovie(movieId: string): void {
    if (!this.movieIds.includes(movieId)) {
      this.movieIds.push(movieId);
    }
  }

  removeMovie(movieId: string): void {
    this.movieIds = this.movieIds.filter(id => id !== movieId);
  }
}