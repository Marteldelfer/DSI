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
import { supabase } from '../config/supabaseConfig'; // Importe o cliente Supabase
import * as FileSystem from 'expo-file-system'; // Importe FileSystem do Expo
import { decode } from 'base64-arraybuffer'; // Importe decode

let localTmdbMovieCache: Map<string, Movie> = new Map();

export class MovieService {
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
        localTmdbMovieCache.set(movie.id, movie);
    }

    // NOVA FUNÇÃO: Upload de pôster para o Supabase Storage
    public async uploadMoviePoster(uri: string, movieId: string): Promise<string | null> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível fazer upload de pôster.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            // Verifica se a URI é uma URL externa ou um arquivo local
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
                // Se for uma URL externa, simplesmente retorna, não precisamos fazer upload
                return uri;
            }

            const fileExtension = uri.split('.').pop();
            const fileName = `${movieId}-${Date.now()}.${fileExtension}`;
            const filePath = `posters/${userId}/${fileName}`; // Caminho: bucket/userId/fileName

            // Lê o arquivo local como base64 e depois decodifica para ArrayBuffer
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            const arrayBuffer = decode(base64);

            const { data, error } = await supabase.storage
                .from('photos') // Nome do bucket: 'photos'
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExtension}`, // Define o tipo de conteúdo
                    upsert: true, // Para sobrescrever se o arquivo já existir
                });

            if (error) {
                throw error;
            }

            const publicUrl = supabase.storage.from('photos').getPublicUrl(filePath);
            return publicUrl.data.publicUrl;

        } catch (error: any) {
            console.error('Erro ao fazer upload do pôster para o Supabase:', error.message);
            throw error;
        }
    }

    // NOVA FUNÇÃO: Deletar pôster do Supabase Storage
    public async deleteMoviePoster(posterUrl: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar pôster.");
            return;
        }

        // Verifica se a URL é de um arquivo Supabase antes de tentar deletar
        if (posterUrl.includes('byifuavvmafihjbxtmyq.supabase.co/storage/v1/object/public/photos/')) {
            try {
                // Extrai o caminho do arquivo do URL público
                const pathInBucket = posterUrl.split('byifuavvmafihjbxtmyq.supabase.co/storage/v1/object/public/photos/')[1];
                const { error } = await supabase.storage.from('photos').remove([pathInBucket]);

                if (error) {
                    console.error('Erro ao deletar pôster do Supabase Storage:', error.message);
                    throw error;
                }
                console.log('Pôster deletado do Supabase Storage:', posterUrl);
            } catch (error) {
                console.error('Erro no processo de deleção do pôster do Supabase:', error);
            }
        }
    }

    public async createExternalMovie(movieData: {
        title: string;
        overview?: string | null;
        releaseYear?: string | null;
        genre?: string | null;
        duration?: number | null;
        posterUrl?: string | null;
        director?: string | null;
    }): Promise<Movie> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar filme externo.");
            throw new Error("Usuário não autenticado.");
        }

        let finalPosterUrl: string | null = movieData.posterUrl ?? null;
        // Se houver posterUri e não for uma URL externa, faz o upload
        if (movieData.posterUrl && !(movieData.posterUrl.startsWith('http://') || movieData.posterUrl.startsWith('https://'))) {
            // Temporariamente, cria um ID antes de salvar no Firestore para usar no nome do arquivo
            // Isso pode ser ajustado para usar o ID do docRef.id após a criação
            const tempMovieId = `temp-${Date.now()}`;
            finalPosterUrl = await this.uploadMoviePoster(movieData.posterUrl, tempMovieId);
        }

        const newExternalMovieData = {
            title: movieData.title,
            overview: movieData.overview ?? null,
            releaseYear: movieData.releaseYear ?? null,
            genre: movieData.genre ?? null,
            duration: movieData.duration ?? null,
            posterUrl: finalPosterUrl, // Usa a URL pública do Supabase
            backdropUrl: null,
            director: movieData.director ?? null,
            isExternal: true,
            isTmdb: false,
            tmdbId: null,
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
            // Se o filme falhar ao ser criado no Firestore, tente deletar o pôster do Storage
            if (finalPosterUrl && finalPosterUrl.includes('byifuavvmafihjbxtmyq.supabase.co/storage/v1/object/public/photos/')) {
                 this.deleteMoviePoster(finalPosterUrl); // Não espera, para não bloquear o erro principal
            }
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
                const currentMovieSnap = await getDoc(movieRef);
                const currentMovieData = currentMovieSnap.data();
                const oldPosterUrl = currentMovieData?.posterUrl;

                let finalPosterUrl: string | null = updatedMovie.posterUrl ?? null;

                // Se o posterUri mudou e não é uma URL externa, faz o upload
                if (updatedMovie.posterUrl && !(updatedMovie.posterUrl.startsWith('http://') || updatedMovie.posterUrl.startsWith('https://')) && updatedMovie.posterUrl !== oldPosterUrl) {
                    finalPosterUrl = await this.uploadMoviePoster(updatedMovie.posterUrl, updatedMovie.id);
                    // Se a foto antiga era do Supabase, deleta
                    if (oldPosterUrl && oldPosterUrl.includes('byifuavvmafihjbxtmyq.supabase.co/storage/v1/object/public/photos/')) {
                         this.deleteMoviePoster(oldPosterUrl);
                    }
                } else if (!updatedMovie.posterUrl && oldPosterUrl && oldPosterUrl.includes('byifuavvmafihjbxtmyq.supabase.co/storage/v1/object/public/photos/')) {
                    // Se o usuário removeu a foto, deleta do Supabase
                    this.deleteMoviePoster(oldPosterUrl);
                } else if (updatedMovie.posterUrl === oldPosterUrl) {
                    // Se a URL não mudou, mantém a mesma (pode ser uma URL externa ou já do Supabase)
                    finalPosterUrl = oldPosterUrl;
                }


                const dataToUpdate = {
                    title: updatedMovie.title,
                    overview: updatedMovie.overview,
                    releaseYear: updatedMovie.releaseYear,
                    genre: updatedMovie.genre,
                    duration: updatedMovie.duration,
                    posterUrl: finalPosterUrl, // Usa a URL pública do Supabase
                    backdropUrl: updatedMovie.backdropUrl,
                    director: updatedMovie.director,
                };
                await updateDoc(movieRef, dataToUpdate);
                console.log("Filme externo atualizado no Firestore:", updatedMovie.id);
            } else if (updatedMovie.isTmdb) {
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
                const movieData = docSnap.data();
                const posterUrlToDelete = movieData.posterUrl;

                await deleteDoc(movieRef);
                console.log("Filme externo deletado do Firestore:", movieId);

                // Tenta deletar o pôster do Supabase Storage se ele existir
                if (posterUrlToDelete) {
                    await this.deleteMoviePoster(posterUrlToDelete);
                }
                
                const reviewsToDelete = await this.reviewService.getReviewsByMovieId(movieId);
                for (const review of reviewsToDelete) {
                    await this.reviewService.deleteReview(review.id);
                }
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
            } catch (error) {
                console.error(`Erro ao buscar status/tags para o filme ${movie.id}:`, error);
            }
        }

        return movie;
    }

    public async getPopularMovies(): Promise<Movie[]> {
        let tmdbPopularMovies: Movie[];
        try {
            tmdbPopularMovies = await getPopularMovies();
        } catch (error) {
            console.error("ERRO CRÍTICO: Falha ao buscar filmes populares da API TMDB.", error);
            return [];
        }

        for (const movie of tmdbPopularMovies) {
            this.addTmdbMovieToCache(movie);
        }

        const userId = this.getCurrentUserId();
        if (!userId) {
            return tmdbPopularMovies;
        }

        try {
            const allUserReviewsMap = new Map<string, MovieStatus>();
            const reviews = await this.reviewService.getAllUserReviews();
            reviews.forEach(r => {
                if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
                else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
                else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
            });

            const moviesWithUserData = tmdbPopularMovies.map(movie => {
                const movieCopy = new Movie({ ...movie });
                movieCopy.status = allUserReviewsMap.get(movie.id) || null;
                return movieCopy;
            });
            return moviesWithUserData;

        } catch (error) {
            console.warn("AVISO: Falha ao buscar avaliações do usuário. Exibindo filmes sem status.", error);
            return tmdbPopularMovies;
        }
    }

   public async searchMovies(query: string): Promise<Movie[]> {
        let tmdbSearchResults: Movie[];
        try {
            tmdbSearchResults = await searchTmdbMovies(query);
        } catch (error) {
            console.error(`ERRO CRÍTICO: Falha ao buscar por "${query}" na API TMDB.`, error);
            return [];
        }

        for (const movie of tmdbSearchResults) {
            this.addTmdbMovieToCache(movie);
        }

        const userId = this.getCurrentUserId();
        if (!userId) {
            return tmdbSearchResults;
        }

        try {
            const allUserReviewsMap = new Map<string, MovieStatus>();
            const reviews = await this.reviewService.getAllUserReviews();
            reviews.forEach(r => {
                if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
                else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
                else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
            });

            const moviesWithUserData = tmdbSearchResults.map(movie => {
                const movieCopy = new Movie({ ...movie });
                movieCopy.status = allUserReviewsMap.get(movie.id) || null;
                return movieCopy;
            });
            return moviesWithUserData;

        } catch (error) {
            console.warn(`AVISO: Falha ao buscar avaliações para a busca "${query}".`, error);
            return tmdbSearchResults;
        }
    }

    public async getFilteredAndRatedMovies(
        sourceFilter: 'all' | 'external' | 'app_db',
        statusFilter: MovieStatus | 'all'
    ): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        let allMoviesCollection: Movie[] = [];

        // 1. Obter todas as avaliações do usuário para identificar filmes avaliados
        const allUserReviewsMap = new Map<string, MovieStatus>();
        const reviews = await this.reviewService.getAllUserReviews();
        reviews.forEach(r => {
            if (r.reviewType === 'like') allUserReviewsMap.set(r.movieId, 'like2');
            else if (r.reviewType === 'dislike') allUserReviewsMap.set(r.movieId, 'dislike2');
            else if (r.reviewType === 'favorite') allUserReviewsMap.set(r.movieId, 'staro');
        });

        const movieIdsWithReviews = Array.from(allUserReviewsMap.keys());

        // 2. Coletar filmes externos (Firebase) e preencher status
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
                    allMoviesCollection.push(movie);
                });
            } catch (error) {
                console.error("Erro ao buscar filmes externos do Firestore:", error);
            }
        }

        // 3. Proativamente buscar e cachear detalhes de filmes TMDB avaliados que não estão no cache local
        const tmdbMovieIdsToFetch = movieIdsWithReviews.filter(movieId =>
            !movieId.startsWith('ext-') && !localTmdbMovieCache.has(movieId) // Verifica se é TMDB e não está no cache
        );

        const fetchedTmdbMoviesPromises = tmdbMovieIdsToFetch.map(async id => {
            try {
                const movie = await getMovieDetails(id);
                if (movie) {
                    this.addTmdbMovieToCache(movie);
                    return movie;
                }
            } catch (e) {
                console.error(`Falha ao buscar detalhes do TMDB para o filme avaliado ${id}:`, e);
            }
            return null;
        });
        await Promise.all(fetchedTmdbMoviesPromises); // Espera todas as buscas TMDB terminarem

        // 4. Coletar filmes TMDB do cache local (agora mais completo) e preencher status
        if (sourceFilter === 'all' || sourceFilter === 'app_db') {
            for (const [movieId, movieFromCache] of localTmdbMovieCache.entries()) {
                // Inclui filmes TMDB se eles foram avaliados OU se são resultados de busca recente (e podem ter status)
                if (allUserReviewsMap.has(movieId) || movieFromCache.status !== null) {
                    const movieCopy = new Movie({ ...movieFromCache });
                    movieCopy.status = allUserReviewsMap.get(movieId) || null;
                    allMoviesCollection.push(movieCopy);
                }
            }
        }

        let filteredMovies = allMoviesCollection;

        // Aplica os filtros de exibição
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

    public async getAllMovies(): Promise<Movie[]> {
        const userId = this.getCurrentUserId();
        if (!userId) return [];

        let allCachedAndExternalMovies: Movie[] = [];

        // Coleta filmes do cache TMDB
        for (const movie of localTmdbMovieCache.values()) {
            allCachedAndExternalMovies.push(movie);
        }

        // Coleta filmes externos do Firestore
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