// aplicativo/src/componentes/ComentariosColapsaveis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, TextInput, Alert, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { styles } from '../styles'; 
import { Comment } from '../../src/models/Comment'; 
import { CommentService } from '../../src/services/CommentService'; 
import { ReviewService } from '../../src/services/ReviewService'; 

interface ComentariosColapsaveisProps {
    avaliacaoId: string; // Este é o reviewDocId do Firestore
}

function ComentariosColapsaveis({ avaliacaoId }: ComentariosColapsaveisProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]); // Estado inicial é um array vazio
    const [newCommentText, setNewCommentText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editText, setEditText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const commentService = CommentService.getInstance();
    const reviewService = ReviewService.getInstance(); 

    const fetchComments = useCallback(async () => {
        // NOVO: Verifica se avaliacaoId é válido antes de tentar buscar comentários
        if (!avaliacaoId) {
            console.warn("avaliacaoId está faltando. Não é possível buscar comentários.");
            setComments([]); // Garante que comments seja um array vazio
            setLoadingComments(false);
            return;
        }

        setLoadingComments(true);
        try {
            const fetchedComments = await commentService.getCommentsByReviewId(avaliacaoId);
            // NOVO: Garante que o valor setado em comments seja um array, mesmo se a Promise retornar undefined (improvável, mas seguro)
            setComments(fetchedComments || []); 
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
            Alert.alert("Erro", "Não foi possível carregar os comentários.");
            setComments([]); // Sempre define para um array vazio em caso de erro
        } finally {
            setLoadingComments(false);
        }
    }, [avaliacaoId, commentService]);

    useFocusEffect(
        useCallback(() => {
            if (!isCollapsed) {
                fetchComments();
            }
            // Resetar o estado da busca e texto do novo comentário ao focar (opcional)
            setNewCommentText('');
            setSearchTerm('');
        }, [isCollapsed, fetchComments])
    );

    // Efeito para recarregar comentários se a avaliacaoId mudar (ex: se o usuário mudar de filme)
    useEffect(() => {
        if (!isCollapsed) {
            fetchComments();
        }
    }, [avaliacaoId, isCollapsed, fetchComments]);


    const handleAddComment = async () => {
        // NOVO: Verifica se avaliacaoId existe antes de adicionar comentário
        if (!avaliacaoId) { 
            Alert.alert("Erro", "ID da avaliação ausente. Não é possível adicionar comentário.");
            return;
        }
        if (newCommentText.trim() === '') {
            Alert.alert("Erro", "O comentário não pode ser vazio.");
            return;
        }
        if (isSubmitting) return; // Evita múltiplas submissões

        setIsSubmitting(true);
        try {
            await commentService.createComment(avaliacaoId, newCommentText.trim());
            setNewCommentText('');
            fetchComments(); // Recarrega a lista de comentários
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
            Alert.alert("Erro", "Não foi possível adicionar o comentário.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        // NOVO: Verifica se avaliacaoId existe antes de deletar comentário
        if (!avaliacaoId) { 
            Alert.alert("Erro", "ID da avaliação ausente. Não é possível deletar comentário.");
            return;
        }
        Alert.alert("Excluir Comentário", "Tem certeza?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir", onPress: async () => {
                    try {
                        await commentService.deleteComment(commentId, avaliacaoId);
                        fetchComments(); // Recarrega a lista de comentários
                    } catch (error) {
                        console.error("Erro ao deletar comentário:", error);
                        Alert.alert("Erro", "Não foi possível excluir o comentário.");
                    }
                }, style: "destructive"
            }
        ]);
    };

    const handleOpenEditModal = (comment: Comment) => {
        setEditingComment(comment);
        setEditText(comment.content);
        setEditModalVisible(true);
    };

    const handleSaveChanges = async () => {
        // NOVO: Verifica se editingComment e avaliacaoId existem antes de salvar
        if (!editingComment || !avaliacaoId) { 
            Alert.alert("Erro", "Dados insuficientes para editar comentário.");
            return;
        }
        if (editText.trim() === '') {
            Alert.alert("Erro", "O comentário não pode ser vazio.");
            return;
        }

        try {
            await commentService.updateComment(editingComment.id, avaliacaoId, editText.trim());
            fetchComments();
            setEditModalVisible(false);
            setEditingComment(null);
        } catch (error) {
            console.error("Erro ao salvar alterações do comentário:", error);
            Alert.alert("Erro", "Não foi possível salvar as alterações do comentário.");
        }
    };

    // NOVO: Adicionado verificação defensiva para garantir que comments é um array antes de chamar filter
    const filteredComments = (comments && Array.isArray(comments)) 
        ? comments.filter(comment => 
            comment.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : []; // Retorna um array vazio se comments não for um array


    return (
        <View style={comentariosStyles.container}>
            <Modal
                transparent={true}
                visible={isEditModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={comentariosStyles.modalBackdrop}>
                    <View style={comentariosStyles.modalContainer}>
                        <Text style={comentariosStyles.modalTitle}>Editar Comentário</Text>
                        <TextInput
                            style={comentariosStyles.modalInput}
                            value={editText}
                            onChangeText={setEditText}
                            placeholder="Edite seu comentário..."
                            placeholderTextColor="#b0b0b0"
                            multiline
                        />
                        <View style={comentariosStyles.modalButtonContainer}>
                            <Pressable style={[comentariosStyles.modalButton, comentariosStyles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                                <Text style={comentariosStyles.buttonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={[comentariosStyles.modalButton, comentariosStyles.saveButton]} onPress={handleSaveChanges}>
                                <Text style={comentariosStyles.buttonText}>Salvar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Pressable style={comentariosStyles.header} onPress={() => setIsCollapsed(!isCollapsed)}>
                <Text style={comentariosStyles.headerText}>
                    Comentários ({comments.length})
                </Text>
                <AntDesign
                    name={isCollapsed ? 'down' : 'up'}
                    size={20}
                    color="#eaeaea"
                />
            </Pressable>

            {!isCollapsed && (
                <View style={comentariosStyles.content}>
                    <View style={[styles.textInput, { height: 40, marginBottom: 15, backgroundColor: '#4A6B8A' }]}>
                        <AntDesign name="search1" size={20} color="#b0b0b0" style={{marginRight: 5}}/>
                        <TextInput
                            placeholder="Pesquisar nos comentários..."
                            placeholderTextColor={"#b0b0b0"}
                            style={[styles.input, { color: '#eaeaea'}]}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    {loadingComments ? (
                        <ActivityIndicator size="small" color="#3E9C9C" style={{ marginVertical: 20 }} />
                    ) : filteredComments.length > 0 ? ( // Usa filteredComments para renderização
                        filteredComments.map(comment => (
                            <View key={comment.id} style={comentariosStyles.commentItem}>
                                <Text style={comentariosStyles.commentText}>{comment.content}</Text>
                                <View style={comentariosStyles.commentActions}>
                                    <Pressable onPress={() => handleOpenEditModal(comment)} style={comentariosStyles.actionButton}>
                                        <AntDesign name="edit" size={18} color="#b0b0b0" />
                                    </Pressable>
                                    <Pressable onPress={() => handleDeleteComment(comment.id)} style={comentariosStyles.actionButton}>
                                        <AntDesign name="delete" size={18} color="#FF6347" />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    ) : (
                        // Adapta as mensagens com base em comments (todos) e filteredComments (após busca)
                        comments.length === 0 && searchTerm.length === 0 ? (
                            <Text style={comentariosStyles.noCommentsText}>Seja o primeiro a comentar!</Text>
                        ) : (
                            <Text style={comentariosStyles.noCommentsText}>Nenhum comentário encontrado na busca.</Text>
                        )
                    )}

                    <View style={comentariosStyles.addCommentContainer}>
                        <TextInput
                            style={comentariosStyles.addCommentInput}
                            placeholder="Adicionar um comentário..."
                            placeholderTextColor="#b0b0b0"
                            value={newCommentText}
                            onChangeText={setNewCommentText}
                            multiline
                        />
                        <Pressable 
                            style={comentariosStyles.addCommentButton} 
                            onPress={handleAddComment}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#3E9C9C" />
                            ) : (
                                <AntDesign name="arrowright" size={24} color="#3E9C9C" />
                            )}
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const comentariosStyles = StyleSheet.create({
    container: { width: '100%', backgroundColor: '#1A2B3E', borderRadius: 8, marginTop: 20, overflow: 'hidden' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    headerText: { color: '#eaeaea', fontSize: 16, fontWeight: 'bold' },
    content: { padding: 15, borderTopWidth: 1, borderTopColor: '#4A6B8A' },
    commentItem: { backgroundColor: '#4A6B8A', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    commentText: { color: '#eaeaea', fontSize: 14, flex: 1, marginRight: 10 },
    commentActions: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 5 },
    noCommentsText: { color: '#b0b0b0', textAlign: 'center', marginVertical: 10 },
    addCommentContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#4A6B8A', paddingTop: 15 },
    addCommentInput: { flex: 1, backgroundColor: '#4A6B8A', borderRadius: 8, padding: 10, color: '#eaeaea', marginRight: 10 },
    addCommentButton: { padding: 5, width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#2E3D50',
        borderRadius: 15,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#eaeaea',
        marginBottom: 15,
    },
    modalInput: {
        backgroundColor: '#1A2B3E',
        color: '#eaeaea',
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#4A6B8A',
    },
    saveButton: {
        backgroundColor: '#3E9C9C',
    },
    buttonText: {
        color: '#eaeaea',
        fontWeight: 'bold',
    },
});

export default ComentariosColapsaveis;