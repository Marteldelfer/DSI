// aplicativo/app/componentes/ComentariosColapsaveis.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { styles } from '../styles';
// Importe as novas classes e serviços
import { Comment } from '../../src/models/Comment'; // Importe a classe Comment
import { CommentService } from '../../src/services/CommentService';
import { ReviewService } from '../../src/services/ReviewService'; // Para verificar se a avaliação existe

interface ComentariosColapsaveisProps {
    avaliacaoId: string;
}

function ComentariosColapsaveis({ avaliacaoId }: ComentariosColapsaveisProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');

    const commentService = CommentService.getInstance();
    const reviewService = ReviewService.getInstance();

    const fetchComments = useCallback(() => {
        // Antes de buscar comentários, verificar se a avaliação existe.
        const reviewExists = reviewService.getReviewById(avaliacaoId);
        if (reviewExists) {
            const fetchedComments = commentService.getCommentsByReviewId(avaliacaoId);
            setComments(fetchedComments);
        } else {
            // Se a avaliação não existe, não há comentários para mostrar.
            setComments([]);
        }
    }, [avaliacaoId, commentService, reviewService]); // Adicione services como dependência

    useFocusEffect(
        useCallback(() => {
            fetchComments();
        }, [fetchComments])
    );

    const handleAddComment = () => {
        if (newCommentText.trim()) {
            commentService.createComment(avaliacaoId, newCommentText.trim());
            setNewCommentText('');
            fetchComments(); // Recarrega os comentários após adicionar
        } else {
            Alert.alert("Erro", "O comentário não pode estar vazio.");
        }
    };

    return (
        <View style={comentariosStyles.container}>
            <Pressable onPress={() => setIsCollapsed(!isCollapsed)} style={comentariosStyles.header}>
                <Text style={comentariosStyles.headerText}>
                    Comentários ({comments.length})
                </Text>
                <AntDesign
                    name={isCollapsed ? 'downcircleo' : 'upcircleo'}
                    size={20}
                    color="#eaeaea"
                />
            </Pressable>

            {!isCollapsed && (
                <View style={comentariosStyles.content}>
                    <View style={styles.textInput}>
                        <TextInput
                            placeholder="Adicionar um comentário..."
                            placeholderTextColor={"grey"}
                            style={styles.input}
                            onChangeText={setNewCommentText}
                            value={newCommentText}
                            onSubmitEditing={handleAddComment}
                        />
                        <Pressable style={comentariosStyles.sendButton} onPress={handleAddComment}>
                            <AntDesign name="arrowright" size={20} color="#eaeaea" />
                        </Pressable>
                    </View>

                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <View key={comment.id} style={comentariosStyles.commentItem}>
                                <Text style={comentariosStyles.commentText}>{comment.content}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={comentariosStyles.noCommentsText}>Nenhum comentário ainda.</Text>
                    )}
                </View>
            )}
        </View>
    );
}

export default ComentariosColapsaveis;

const comentariosStyles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2E3D50',
    },
    headerText: {
        color: '#eaeaea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#4A6B8A',
    },
    sendButton: {
        backgroundColor: '#3E9C9C',
        padding: 8,
        borderRadius: 20,
        marginLeft: 10,
    },
    commentItem: {
        backgroundColor: '#4A6B8A',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    commentText: {
        color: '#eaeaea',
        fontSize: 14,
    },
    noCommentsText: {
        color: '#b0b0b0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
});