// aplicativo/src/services/ReviewService.ts
import { Review, ReviewType } from '../models/Review';
import { MovieStatus } from '../models/Movie'; 
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
    getDoc 
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig'; 
import { getAuth } from 'firebase/auth'; 

export class ReviewService {
    private static instance: ReviewService;
    private db = getFirestore(app);

    private constructor() {}

    public static getInstance(): ReviewService {
        if (!ReviewService.instance) {
            ReviewService.instance = new ReviewService();
        }
        return ReviewService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app);
        return auth.currentUser?.uid || null;
    }

    private getUserReviewsCollection(userId: string) {
        return collection(this.db, `users/${userId}/reviews`);
    }

    public async createReview(reviewData: { movieId: string; content?: string; reviewType: ReviewType }): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar/atualizar avaliação.");
            throw new Error("Usuário não autenticado.");
        }

        const dataToSave = {
            movieId: reviewData.movieId,
            reviewType: reviewData.reviewType,
            content: reviewData.content ?? null, 
            timestamp: new Date().toISOString(),
        };

        try {
            const q = query(this.getUserReviewsCollection(userId), where("movieId", "==", reviewData.movieId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const existingReviewDoc = querySnapshot.docs[0];
                await updateDoc(doc(this.db, `users/${userId}/reviews`, existingReviewDoc.id), dataToSave);
                console.log("Avaliação atualizada com sucesso!");
            } else {
                await addDoc(this.getUserReviewsCollection(userId), dataToSave);
                console.log("Nova avaliação criada com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao criar/atualizar avaliação: ", e);
            throw e;
        }
    }

    public async getReviewsByMovieId(movieId: string): Promise<Review[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando avaliações vazias.");
            return [];
        }

        try {
            const q = query(this.getUserReviewsCollection(userId), where("movieId", "==", movieId));
            const querySnapshot = await getDocs(q);
            
            const reviews: Review[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reviews.push(new Review({
                    id: doc.id, 
                    movieId: data.movieId,
                    reviewType: data.reviewType as ReviewType, 
                    content: data.content,
                    timestamp: data.timestamp,
                }));
            });
            return reviews;
        } catch (e) {
            console.error("Erro ao buscar avaliações por filme: ", e);
            throw e;
        }
    }

    public async deleteReview(reviewDocId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar avaliação.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            await deleteDoc(doc(this.db, `users/${userId}/reviews`, reviewDocId));
            console.log("Avaliação deletada com sucesso!");
        } catch (e) {
            console.error("Erro ao deletar avaliação: ", e);
            throw e;
        }
    }

    public async getReviewById(reviewDocId: string): Promise<Review | undefined> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando avaliação vazia.");
            return undefined;
        }

        try {
            const docRef = doc(this.db, `users/${userId}/reviews`, reviewDocId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return new Review({
                    id: docSnap.id, 
                    movieId: data.movieId,
                    reviewType: data.reviewType as ReviewType,
                    content: data.content,
                    timestamp: data.timestamp,
                });
            } else {
                console.log("Nenhuma avaliação encontrada com o ID:", reviewDocId);
                return undefined;
            }
        } catch (e) {
            console.error("Erro ao buscar avaliação por ID: ", e);
            throw e;
        }
    }

    // NOVO MÉTODO: Busca TODAS as avaliações do usuário atual
    public async getAllUserReviews(): Promise<Review[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando avaliações vazias.");
            return [];
        }

        try {
            const q = query(this.getUserReviewsCollection(userId)); 
            const querySnapshot = await getDocs(q);
            
            const reviews: Review[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reviews.push(new Review({
                    id: doc.id,
                    movieId: data.movieId,
                    reviewType: data.reviewType as ReviewType,
                    content: data.content,
                    timestamp: data.timestamp,
                }));
            });
            return reviews;
        } catch (e) {
            console.error("Erro ao buscar todas as avaliações do usuário: ", e);
            throw e;
        }
    }
}