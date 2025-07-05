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

  // MODIFICADO: createReview agora faz um "upsert" (atualiza ou cria)
  createReview(reviewData: { movieId: string; content?: string; reviewType: ReviewType }): Review {
    // Tenta encontrar uma avaliação existente para o filme
    const existingReviewIndex = localReviews.findIndex(r => r.movieId === reviewData.movieId);

    let reviewToSave: Review;

    if (existingReviewIndex !== -1) {
      // Se a avaliação existir, atualiza ela com os novos dados
      reviewToSave = localReviews[existingReviewIndex];
      reviewToSave.content = reviewData.content;
      reviewToSave.reviewType = reviewData.reviewType;
      // Não mudamos o ID aqui, pois é uma atualização
    } else {
      // Se não existir, cria uma nova avaliação
      reviewToSave = new Review(reviewData);
      if (!reviewToSave.id) {
          reviewToSave.id = `rev-${Date.now()}`; // Garante que tenha um ID
      }
      localReviews.push(reviewToSave); // Adiciona a nova avaliação à lista
    }

    // Atualiza o status do filme correspondente no MovieService
    const movie = this.movieService.getAllMovies().find(m => m.id === reviewToSave.movieId);
    if (movie) {
      let status: MovieStatus = null;
      if (reviewToSave.reviewType === 'like') status = 'like2';
      if (reviewToSave.reviewType === 'dislike') status = 'dislike2';
      if (reviewToSave.reviewType === 'favorite') status = 'staro';
      
      movie.status = status;
      this.movieService.updateMovie(movie); 
    }
    return reviewToSave; // Retorna a avaliação (nova ou atualizada)
  }

  getReviewById(id: string): Review | undefined {
    return localReviews.find(r => r.id === id);
  }

  // Retorna as avaliações para um dado filme.
  // Como createReview agora faz upsert, deveria haver no máximo uma por filme por "usuário" (assumindo single-user ou ID de avaliação baseado em filmeId+userId)
  getReviewsByMovieId(movieId: string): Review[] {
    return localReviews.filter(review => review.movieId === movieId);
  }

  getAllReviews(): Review[] {
    return [...localReviews];
  }
}