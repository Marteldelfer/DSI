// aplicativo/src/models/Tag.ts
export class Tag {
  id: string;
  movieId: string;
  type: string; // Ex: 'watched_on', 'interest', 're_watch'
  value: string; // Ex: '2023-10-26', 'high', 'yes'
  timestamp?: string; // NOVO: Adicionado campo timestamp

  constructor(data: { id?: string; movieId: string; type: string; value: string; timestamp?: string }) {
    this.id = data.id || `tag-${Date.now()}`; // Garante um ID único localmente se não for fornecido
    this.movieId = data.movieId;
    this.type = data.type;
    this.value = data.value;
    this.timestamp = data.timestamp; // Inicializa o timestamp
  }
}