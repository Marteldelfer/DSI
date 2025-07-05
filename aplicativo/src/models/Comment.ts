// aplicativo/src/models/Comment.ts
export class Comment { // <<<<< O NOME DA CLASSE AGORA É Comment
  id: string;
  reviewId: string; 
  content: string;

  constructor(data: { id?: string; reviewId: string; content: string }) {
    this.id = data.id || `com-${Date.now()}`; 
    this.reviewId = data.reviewId;
    this.content = data.content;
  }
}