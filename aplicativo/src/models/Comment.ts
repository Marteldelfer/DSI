// aplicativo/src/models/Comment.ts
export class Comment {
  id: string;
  reviewId: string; // Associado a uma avaliação
  content: string;
  // userId: string; // Adicionar se necessário

  constructor(data: { id?: string; reviewId: string; content: string }) {
    this.id = data.id || `com-${Date.now()}`;
    this.reviewId = data.reviewId;
    this.content = data.content;
  }
}