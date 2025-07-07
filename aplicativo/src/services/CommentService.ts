// aplicativo/src/services/CommentService.ts
import { Comment } from '../models/Comment';
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
    orderBy, // Adicionado para ordenar comentários por timestamp
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig'; // Importa 'app' do firebaseConfig
import { getAuth } from 'firebase/auth'; // Importe getAuth para obter o UID do usuário

class CommentService {
    private static instance: CommentService;
    private db = getFirestore(app); // Inicializa o Firestore

    private constructor() {}

    public static getInstance(): CommentService {
        if (!CommentService.instance) {
            CommentService.instance = new CommentService();
        }
        return CommentService.instance;
    }

    private getCurrentUserId(): string | null {
        const auth = getAuth(app); // Obtém a instância de autenticação
        return auth.currentUser?.uid || null; // Retorna o UID do usuário logado
    }

    // Retorna a coleção de comentários para uma revisão específica de um usuário
    private getUserReviewCommentsCollection(userId: string, reviewDocId: string) {
        return collection(this.db, `users/${userId}/reviews/${reviewDocId}/comments`);
    }

    // Cria um novo comentário para uma avaliação específica
    public async createComment(reviewDocId: string, content: string): Promise<Comment> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível criar comentário.");
            throw new Error("Usuário não autenticado.");
        }

        const newCommentData = {
            reviewId: reviewDocId,
            content: content,
            timestamp: new Date().toISOString(), // Adiciona o timestamp
            // Pode adicionar userId do comentador aqui se for diferente do userId da review
        };

        try {
            const docRef = await addDoc(this.getUserReviewCommentsCollection(userId, reviewDocId), newCommentData);
            const newComment = new Comment({
                id: docRef.id,
                reviewId: reviewDocId,
                content: content,
                timestamp: newCommentData.timestamp,
            });
            console.log("Comentário criado com sucesso com ID:", docRef.id);
            return newComment;
        } catch (e) {
            console.error("Erro ao criar comentário: ", e);
            throw e;
        }
    }

    // Busca todos os comentários para uma avaliação específica
    public async getCommentsByReviewId(reviewDocId: string): Promise<Comment[]> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn("Usuário não autenticado. Retornando comentários vazios.");
            return [];
        }

        try {
            // Ordena os comentários por timestamp para mostrar os mais recentes primeiro
            const q = query(this.getUserReviewCommentsCollection(userId, reviewDocId), orderBy("timestamp", "asc"));
            const querySnapshot = await getDocs(q);
            
            const comments: Comment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                comments.push(new Comment({
                    id: doc.id,
                    reviewId: data.reviewId,
                    content: data.content,
                    timestamp: data.timestamp,
                }));
            });
            return comments;
        } catch (e) {
            console.error("Erro ao buscar comentários por reviewId: ", e);
            throw e;
        }
    }

    // Atualiza o conteúdo de um comentário existente
    public async updateComment(commentDocId: string, reviewDocId: string, newContent: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível atualizar comentário.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const commentRef = doc(this.db, `users/${userId}/reviews/${reviewDocId}/comments`, commentDocId);
            await updateDoc(commentRef, { content: newContent, timestamp: new Date().toISOString() }); // Atualiza timestamp também
            console.log("Comentário atualizado com sucesso!");
        } catch (e) {
            console.error("Erro ao atualizar comentário: ", e);
            throw e;
        }
    }

    // Deleta um comentário
    public async deleteComment(commentDocId: string, reviewDocId: string): Promise<void> {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.error("Usuário não autenticado. Não é possível deletar comentário.");
            throw new Error("Usuário não autenticado.");
        }

        try {
            const commentRef = doc(this.db, `users/${userId}/reviews/${reviewDocId}/comments`, commentDocId);
            await deleteDoc(commentRef);
            console.log("Comentário deletado com sucesso!");
        } catch (e) {
            console.error("Erro ao deletar comentário: ", e);
            throw e;
        }
    }
}

export { CommentService };