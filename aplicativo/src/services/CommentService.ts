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
    if (!newComment.id) {
        newComment.id = `com-${Date.now()}-${Math.random()}`;
    }
    localComments.push(newComment); 
    return newComment;
  }

  updateComment(commentId: string, newContent: string): void {
    const commentIndex = localComments.findIndex(c => c.id === commentId);
    if (commentIndex > -1) {
      localComments[commentIndex].content = newContent;
    }
  }

  deleteComment(commentId: string): void {
    localComments = localComments.filter(c => c.id !== commentId);
  }

  getCommentsByReviewId(reviewId: string): Comment[] {
    return localComments.filter(c => c.reviewId === reviewId);
  }
  
  deleteCommentsByReviewId(reviewId: string): void {
    localComments = localComments.filter(comment => comment.reviewId !== reviewId);
  }

  getAllComments(): Comment[] {
    return [...localComments];
  }
}