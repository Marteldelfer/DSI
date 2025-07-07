// aplicativo/src/models/Comment.ts
export class Comment {
  id: string;
  reviewId: string; // O ID da avaliação a qual o comentário pertence (será o doc.id da review no Firestore)
  content: string;
  timestamp?: string; // NOVO: Adicionado campo timestamp

  constructor(data: { id?: string; reviewId: string; content: string; timestamp?: string }) {
    this.id = data.id || `com-${Date.now()}`; // Garante um ID único localmente se não for fornecido
    this.reviewId = data.reviewId;
    this.content = data.content;
    this.timestamp = data.timestamp; // Inicializa o timestamp
  }
}