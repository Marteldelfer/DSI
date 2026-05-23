// aplicativo/src/models/Review.ts
export type ReviewType = "like" | "dislike" | "favorite";

export class Review {
  id: string;
  movieId: string;
  content?: string; // O conteúdo do comentário principal da avaliação
  reviewType: ReviewType; // Tipo da avaliação (like, dislike, favorite)
  timestamp?: string; // NOVO: Adicionado campo timestamp

  constructor(data: { id?: string; movieId: string; content?: string; reviewType: ReviewType; timestamp?: string }) {
    this.id = data.id || `rev-${Date.now()}`; // Garante um ID único
    this.movieId = data.movieId;
    this.content = data.content;
    this.reviewType = data.reviewType;
    this.timestamp = data.timestamp; // Inicializa o timestamp
  }
}