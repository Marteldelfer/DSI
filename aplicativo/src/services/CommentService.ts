// aplicativo/src/services/CommentService.ts
import { Comment } from '../models/Comment';

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
    const newComment = new Comment({ reviewId, content });
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