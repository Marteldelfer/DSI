// aplicativo/src/services/ReviewService.ts
import { Review, ReviewType } from '../models/Review';
import { MovieService } from './MovieService';
import { MovieStatus } from '../models/Movie';

let localReviews: Review[] = [];

export class ReviewService {
  private static instance: ReviewService;
  private movieService: MovieService;

  private constructor() {
    this.movieService = MovieService.getInstance();
  }

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  createReview(reviewData: { movieId: string; content?: string; reviewType: ReviewType }): Review {
    const newReview = new Review(reviewData);
    localReviews.push(newReview);

    // Atualiza o status do filme correspondente
    const movie = this.movieService.getAllMovies().find(m => m.id === newReview.movieId);
    if (movie) {
      let status: MovieStatus = null;
      if (newReview.reviewType === 'like') status = 'like2';
      if (newReview.reviewType === 'dislike') status = 'dislike2';
      if (newReview.reviewType === 'favorite') status = 'staro';
      movie.status = status;
      this.movieService.updateMovie(movie); // Atualiza o filme no serviço de filmes
    }
    return newReview;
  }

  getReviewById(id: string): Review | undefined {
    return localReviews.find(r => r.id === id);
  }

  getReviewsByMovieId(movieId: string): Review[] {
    return localReviews.filter(r => r.movieId === movieId);
  }

  getAllReviews(): Review[] {
    return [...localReviews];
  }

  // Métodos de atualização e exclusão podem ser adicionados aqui
}