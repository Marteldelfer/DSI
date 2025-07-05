// aplicativo/src/services/CommentService.ts
import { Comment } from '../models/Comment'; // <<<<< Importa a CLASSE Comment

let localComments: Comment[] = []; 

export class CommentService {
  private static instance: CommentService;

  private constructor() {}

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  createComment(reviewId: string, content: string): Comment {
    const newComment = new Comment({ reviewId, content }); // <<<<< Instancia a CLASSE Comment
    if (!newComment.id) {
        newComment.id = `com-${Date.now()}`;
    }
    localComments.push(newComment); 
    return newComment;
  }

  getCommentsByReviewId(reviewId: string): Comment[] {
    return localComments.filter(c => c.reviewId === reviewId);
  }

  getAllComments(): Comment[] {
    return [...localComments];
  }
}