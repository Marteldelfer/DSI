// aplicativo/src/models/Tag.ts
export type WatchedStatus = "assistido" | "assistido_old" | "drop" | "nao_assistido";
export type InterestStatus = "sim" | "nao";
export type RewatchStatus = "sim" | "nao";

export class Tag {
  id: string;
  userId: string; // email_usuario renomeado para userId
  movieId: string; // id_filme renomeado para movieId
  watched?: WatchedStatus;
  interest?: InterestStatus;
  rewatch?: RewatchStatus;

  constructor(data: {
    id?: string;
    userId: string;
    movieId: string;
    watched?: WatchedStatus;
    interest?: InterestStatus;
    rewatch?: RewatchStatus;
  }) {
    this.id = data.id || `${data.movieId}-${data.userId}`;
    this.userId = data.userId;
    this.movieId = data.movieId;
    this.watched = data.watched;
    this.interest = data.interest;
    this.rewatch = data.rewatch;
  }
}