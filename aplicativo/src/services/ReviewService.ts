// aplicativo/src/services/ReviewService.ts
import { Review, ReviewType } from '../models/Review';
import { MovieService } from './MovieService';
import { MovieStatus } from '../models/Movie'; 
import { CommentService } from './CommentService';

let localReviews: Review[] = [];

export class ReviewService {
  private static instance: ReviewService;
  private movieService: MovieService;
  private commentService: CommentService;

  private constructor() {
    this.movieService = MovieService.getInstance();
    this.commentService = CommentService.getInstance();
  }

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  createReview(reviewData: { movieId: string; content?: string; reviewType: ReviewType }): Review {
    const existingReviewIndex = localReviews.findIndex(r => r.movieId === reviewData.movieId);
    let reviewToSave: Review;

    if (existingReviewIndex > -1) {
      reviewToSave = localReviews[existingReviewIndex];
      reviewToSave.content = reviewData.content;
      reviewToSave.reviewType = reviewData.reviewType;
    } else {
      reviewToSave = new Review({ ...reviewData, id: `rev-${Date.now()}` });
      localReviews.push(reviewToSave);
    }

    const movie = this.movieService.getAllMovies().find(m => m.id === reviewToSave.movieId);
    if (movie) {
      let status: MovieStatus = null;
      if (reviewToSave.reviewType === 'like') status = 'like2';
      if (reviewToSave.reviewType === 'dislike') status = 'dislike2';
      if (reviewToSave.reviewType === 'favorite') status = 'staro';
      
      movie.status = status;
      this.movieService.updateMovie(movie); 
    }
    return reviewToSave;
  }

  deleteReview(reviewId: string): void {
    const reviewIndex = localReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex > -1) {
      const reviewToDelete = localReviews[reviewIndex];
      const movie = this.movieService.getAllMovies().find(m => m.id === reviewToDelete.movieId);
      if (movie) {
        movie.status = null;
        this.movieService.updateMovie(movie);
      }
      this.commentService.deleteCommentsByReviewId(reviewToDelete.id);
      localReviews.splice(reviewIndex, 1);
    }
  }

  getReviewById(id: string): Review | undefined {
    return localReviews.find(r => r.id === id);
  }

  getReviewsByMovieId(movieId: string): Review[] {
    return localReviews.filter(review => review.movieId === movieId);
  }
}