// aplicativo/src/services/MovieService.ts
import { Movie, MovieStatus } from '../models/Movie';
import { getPopularMovies, getMovieDetails, searchMovies as searchTmdbMovies } from '../api/tmdb';
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    getDoc // Importe getDoc
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';

import { ReviewService } from './ReviewService'; 
import { TagService } from './TagService'; 

let localTmdbMovieCache: Map<string, Movie> = new Map();

export class MovieService { // Removido 'class' aqui pois já existe um 'export class'
    private static instance: MovieService;
    private db = getFirestore(app);

    private reviewService: ReviewService;
    private tagService: TagService;

    private constructor() {
        this.reviewService = ReviewService.getInstance();
        this.tagService = TagService.getInstance();
    }

    public static getInstance(): MovieService {
        if (!MovieService.instance) {
            MovieService.instance = new MovieService();
        }
        return MovieService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    private getUserExternalMoviesCollection(userId: string) {
        return collection(this.db, `users/${userId}/externalMovies`);
    }

    public addTmdbMovieToCache(movie: Movie): void {
        // Quando um filme TMDB é adicionado ao cache, ele deve ser uma cópia,
        // e seu status (se já avaliado pelo usuário) deve ser mantido/atualizado.
        // A lógica de preencher o status para TMDBMovies agora está em getMovieById, getPopularMovies, searchMovies.
        localTmdbMovieCache.set(movie.id, movie);
    }

    public async createExternalMovie(movieData: {
        title: string;
        overview?: string | null; // Alterado para aceitar null
        releaseYear?: string | null; // Alterado para aceitar null
        genre?: string | null; // Alterado para aceitar null
        duration?: number | null; // Alterado para aceitar null
        posterUrl?: string | null; // Alterado para aceitar null
        director?: string | null; // Adicionado para consistência
    }): Promise<Movie> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar filme externo.");
            throw new Error("Usuário não autenticado.");
        }

        const newExternalMovieData = {
            title: movieData.title,
            overview: movieData.overview ?? null,
            releaseYear: movieData.releaseYear ?? null,
            genre: movieData.genre ?? null,
            duration: movieData.duration ?? null,
            posterUrl: movieData.posterUrl ?? null,
            backdropUrl: null, // Filmes externos geralmente não têm backdrop
            director: movieData.director ?? null, // Adicionado
            isExternal: true,
            isTmdb: false,
            tmdbId: null, // Para filmes externos não há tmdbId
        };

        try {
            const docRef = await addDoc(this.getUserExternalMoviesCollection(userId), newExternalMovieData);
            const newMovie = new Movie({
                id: docRef.id, 
                ...newExternalMovieData,
                status: null, 
            });
            console.log("Filme externo criado com sucesso no Firestore com ID:", docRef.id);
            return newMovie;
        } catch (e) {
            console.error("Erro ao criar filme externo: ", e);
            throw e;
        }
    }

    public async updateMovie(updatedMovie: Movie): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar filme.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            if (updatedMovie.isExternal) {
                const movieRef = doc(this.db, `users/${userId}/externalMovies`, updatedMovie.id);
                const dataToUpdate = {
                    title: updatedMovie.title,
                    overview: updatedMovie.overview,
                    releaseYear: updatedMovie.releaseYear,
                    genre: updatedMovie.genre,
                    duration: updatedMovie.duration,
                    posterUrl: updatedMovie.posterUrl,
                    backdropUrl: updatedMovie.backdropUrl, // Incluído
                    director: updatedMovie.director, // Incluído
                    // isExternal, isTmdb, tmdbId não devem ser alterados na atualização
                };
                await updateDoc(movieRef, dataToUpdate);
                console.log("Filme externo atualizado no Firestore:", updatedMovie.id);
            } else if (updatedMovie.isTmdb) {
                // Para filmes TMDB, apenas atualiza o cache local (status/tags são gerenciados pelos respectivos serviços)
                this.addTmdbMovieToCache(updatedMovie); 
                console.log("Filme TMDB atualizado no cache local:", updatedMovie.id);
            } else {
                console.warn("Tentativa de atualizar filme de tipo desconhecido:", updatedMovie.id);
            }
        } catch (e) {
            console.error("Erro ao atualizar filme: ", e);
            throw e;
        }
    }

    public async deleteMovie(movieId: string): Promise<boolean> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar filme.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const movieRef = doc(this.db, `users/${userId}/externalMovies`, movieId);
            const docSnap = await getDoc(movieRef); 

            if (docSnap.exists() && docSnap.data().isExternal) {
                await deleteDoc(movieRef);
                console.log("Filme externo deletado do Firestore:", movieId);
                
                const reviewsToDelete = await this.reviewService.getReviewsByMovieId(movieId);
                for (const review of reviewsToDelete) {
                    await this.reviewService.deleteReview(review.id); 
                }
                // Implementar lógica similar para Tags quando TagService for atualizado (TagService.deleteTagsByMovieId(movieId))
                // (Este método precisaria ser criado no TagService)

                localTmdbMovieCache.delete(movieId);

                return true;
            } else {
                console.warn("Tentativa de deletar filme não externo ou inexistente:", movieId);
                return false;
            }
        } catch (e) {
            console.error("Erro ao deletar filme: ", e);
            throw e;
        }
    }

    public async getMovieById(movieId: string): Promise<Movie | undefined> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Não é possível buscar filme.");
            return undefined;
        }

        let movie: Movie | undefined;

        // 1. Tenta buscar como filme externo do Firestore
        try {
            const externalMovieRef = doc(this.db, `users/${userId}/externalMovies`, movieId);
            const docSnap = await getDoc(externalMovieRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                movie = new Movie({
                    id: docSnap.id,
                    title: data.title,
                    overview: data.overview ?? null,
                    releaseYear: data.releaseYear ?? null,
                    genre: data.genre ?? null,
                    duration: data.duration ?? null,
                    posterUrl: data.posterUrl ?? null,
                    backdropUrl: data.backdropUrl ?? null,
                    director: data.director ?? null,
                    tmdbId: data.tmdbId ?? null,
                    isExternal: true,
                    isTmdb: false,
                });
                console.log("Filme externo encontrado no Firestore:", movieId);
            }
        } catch (error) {
            console.error(`Erro ao buscar filme externo ${movieId} no Firestore:`, error);
        }
        
        // 2. Se não encontrado como externo, tenta no cache local (TMDB)
        if (!movie && localTmdbMovieCache.has(movieId)) {
            movie = localTmdbMovieCache.get(movieId);
            console.log("Filme encontrado no cache local (TMDB):", movieId);
        }

        // 3. Se ainda não encontrado, e o ID não parece ser de filme externo, busca na API do TMDB
        if (!movie && !movieId.startsWith('ext-')) { 
            try {
                const tmdbMovie = await getMovieDetails(movieId);
                if (tmdbMovie) {
                    movie = tmdbMovie;
                    this.addTmdbMovieToCache(movie); 
                    console.log("Filme encontrado na API do TMDB:", movieId);
                }
            } catch (error) {
                console.error(`Erro ao buscar filme TMDB ${movieId} na API:`, error);
            }
        }

        // 4. Se um filme foi encontrado, preenche seu status de avaliação e tags
        if (movie) {
            try {
                const reviews = await this.reviewService.getReviewsByMovieId(movie.id);
                if (reviews.length > 0) {
                    const review = reviews[0];
                    if (review.reviewType === 'like') movie.status = 'like2';
                    else if (review.reviewType === 'dislike') movie.status = 'dislike2';
                    else if (review.reviewType === 'favorite') movie.status = 'staro';
                    else movie.status = null;
                } else {
                    movie.status = null;
                }
                // // Preenche as tags do usuário (quando TagService for Firestore-based)
                // const tags = await this.tagService.getTagsByMovieId(movie.id); // Este método precisa existir
                // movie.tags = tags; // Supondo que Movie tenha uma propriedade 'tags'
            } catch (error) {
                console.error(`Erro ao buscar status/tags para o filme ${movie.id}:`, error);
            }
        }
        
        return movie;
    }

    public async getPopularMovies(): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        try {
            const tmdbPopularMovies = await getPopularMovies();
            const moviesWithUserData: Movie[] = [];

            const allUserReviewsMap = new Map<string, MovieStatus>();
            // CHAMA O NOVO MÉTODO getAllUserReviews() do ReviewService
            const reviews = await this.reviewService.getAllUserReviews(); 
            reviews.forEach(r => {
                if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
                else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
                else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
            });

            for (const movie of tmdbPopularMovies) {
                this.addTmdbMovieToCache(movie);
                const movieCopy = new Movie({ ...movie }); // Cria uma nova instância para modificação

                movieCopy.status = allUserReviewsMap.get(movie.id) || null;
                moviesWithUserData.push(movieCopy);
            }
            return moviesWithUserData;
        } catch (error) {
            console.error("Erro ao buscar filmes populares TMDB:", error);
            return [];
        }
    }

    public async searchMovies(query: string): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        try {
            const tmdbSearchResults = await searchTmdbMovies(query);
            const moviesWithUserData: Movie[] = [];

            const allUserReviewsMap = new Map<string, MovieStatus>();
            // CHAMA O NOVO MÉTODO getAllUserReviews() do ReviewService
            const reviews = await this.reviewService.getAllUserReviews();
            reviews.forEach(r => {
                if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
                else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
                else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
            });

            for (const movie of tmdbSearchResults) {
                this.addTmdbMovieToCache(movie);
                const movieCopy = new Movie({ ...movie });

                movieCopy.status = allUserReviewsMap.get(movie.id) || null;
                moviesWithUserData.push(movieCopy);
            }
            return moviesWithUserData;
        } catch (error) {
            console.error("Erro ao buscar filmes TMDB:", error);
            return [];
        }
    }

    public async getFilteredAndRatedMovies(
        sourceFilter: 'all' | 'external' | 'app_db',
        statusFilter: MovieStatus | 'all'
    ): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        let allMovies: Movie[] = [];
        
        // Otimização: Buscar todas as reviews do usuário de uma vez
        const allUserReviewsMap = new Map<string, MovieStatus>();
        const reviews = await this.reviewService.getAllUserReviews(); // NOVO MÉTODO NECESSÁRIO NO ReviewService
        reviews.forEach(r => {
            if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
            else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
            else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
        });

        // 1. Obter filmes externos do Firestore
        if (sourceFilter === 'all' || sourceFilter === 'external') {
            try {
                const q = query(this.getUserExternalMoviesCollection(userId));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const movie = new Movie({
                        id: docSnap.id,
                        title: data.title,
                        overview: data.overview ?? null,
                        releaseYear: data.releaseYear ?? null,
                        genre: data.genre ?? null,
                        duration: data.duration ?? null,
                        posterUrl: data.posterUrl ?? null,
                        backdropUrl: data.backdropUrl ?? null,
                        director: data.director ?? null,
                        tmdbId: data.tmdbId ?? null,
                        isExternal: true,
                        isTmdb: false,
                        status: allUserReviewsMap.get(docSnap.id) || null, // Preenche status
                    });
                    allMovies.push(movie);
                });
            } catch (error) {
                console.error("Erro ao buscar filmes externos do Firestore:", error);
            }
        }

        // 2. Obter filmes TMDB do cache local que o usuário interagiu
        if (sourceFilter === 'all' || sourceFilter === 'app_db') {
            for (const [movieId, movieFromCache] of localTmdbMovieCache.entries()) {
                if (allUserReviewsMap.has(movieId)) { 
                    const movieCopy = new Movie({ ...movieFromCache });
                    movieCopy.status = allUserReviewsMap.get(movieId) || null;
                    allMovies.push(movieCopy);
                }
            }
        }
        
        let filteredMovies = allMovies;

        if (sourceFilter === 'external') {
            filteredMovies = filteredMovies.filter(movie => movie.isExternal);
        } else if (sourceFilter === 'app_db') {
            filteredMovies = filteredMovies.filter(movie => movie.isTmdb);
        }

        if (statusFilter !== 'all') {
            filteredMovies = filteredMovies.filter(movie => movie.status === statusFilter);
        }

        const uniqueMovies = Array.from(new Map(filteredMovies.map(movie => [movie.id, movie])).values());

        return uniqueMovies;
    }

    // Método auxiliar para obter todos os filmes do cache (para compatibilidade temporária)
    // Este método agora é mais robusto, combinando o cache TMDB e filmes externos.
    // Usado em PlaylistService atualmente.
    public async getAllMovies(): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        let allCachedAndExternalMovies: Movie[] = [];

        // Adiciona filmes do cache TMDB
        for (const movie of localTmdbMovieCache.values()) {
            allCachedAndExternalMovies.push(movie);
        }

        // Adiciona filmes externos do Firestore
        try {
            const q = query(this.getUserExternalMoviesCollection(userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                const movie = new Movie({
                    id: docSnap.id,
                    title: data.title,
                    overview: data.overview ?? null,
                    releaseYear: data.releaseYear ?? null,
                    genre: data.genre ?? null,
                    duration: data.duration ?? null,
                    posterUrl: data.posterUrl ?? null,
                    backdropUrl: data.backdropUrl ?? null,
                    director: data.director ?? null,
                    tmdbId: data.tmdbId ?? null,
                    isExternal: true,
                    isTmdb: false,
                    status: null, // Status será preenchido on-demand ou por reviewsService
                });
                allCachedAndExternalMovies.push(movie);
            });
        } catch (error) {
            console.error("Erro ao buscar todos os filmes externos para getAllMovies:", error);
        }

        // Otimização: Preencher o status de avaliação para todos os filmes
        const allUserReviewsMap = new Map<string, MovieStatus>();
        const reviews = await this.reviewService.getAllUserReviews();
        reviews.forEach(r => {
            if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
            else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
            else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
        });

        for (const movie of allCachedAndExternalMovies) {
            movie.status = allUserReviewsMap.get(movie.id) || null;
        }

        return Array.from(new Map(allCachedAndExternalMovies.map(movie => [movie.id, movie])).values());
    }
}