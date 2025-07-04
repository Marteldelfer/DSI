// aplicativo/src/models/Review.ts
export type ReviewType = "like" | "dislike" | "favorite";

export class Review {
  id: string;
  movieId: string;
  content?: string;
  reviewType: ReviewType;
  // userId: string; // Adicionar se for necessário associar a um usuário

  constructor(data: { id?: string; movieId: string; content?: string; reviewType: ReviewType }) {
    this.id = data.id || `rev-${Date.now()}`; // Gerar ID se não fornecido
    this.movieId = data.movieId;
    this.content = data.content;
    this.reviewType = data.reviewType;
  }
}