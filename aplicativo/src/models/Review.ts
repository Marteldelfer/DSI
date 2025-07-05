// aplicativo/src/models/Review.ts
export type ReviewType = "like" | "dislike" | "favorite";

export class Review { // <<<<< O NOME DA CLASSE AGORA É Review
  id: string;
  movieId: string;
  content?: string; // O conteúdo do comentário principal da avaliação
  reviewType: ReviewType; // Tipo da avaliação (like, dislike, favorite)

  constructor(data: { id?: string; movieId: string; content?: string; reviewType: ReviewType }) {
    this.id = data.id || `rev-${Date.now()}`; // Garante um ID único
    this.movieId = data.movieId;
    this.content = data.content;
    this.reviewType = data.reviewType;
  }
}