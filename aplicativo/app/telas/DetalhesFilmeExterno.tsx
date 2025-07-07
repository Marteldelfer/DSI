// aplicativo/app/telas/DetalhesFilmeExterno.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles'; // Seus estilos globais
import { Movie } from '../../src/models/Movie'; //
import { MovieService } from '../../src/services/MovieService';
import { Review } from '../../src/models/Review'; //
import { ReviewService } from '../../src/services/ReviewService';
import ComentariosColapsaveis from '../componentes/ComentariosColapsaveis'; //

function DetalhesFilmeExterno() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams(); 
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);

  const movieService = MovieService.getInstance();
  const reviewService = ReviewService.getInstance();

  useFocusEffect(
    useCallback(() => {
      const loadMovieDetailsAndReview = async () => { // TORNADO ASYNC
        setLoading(true);
        if (movieId) {
          try {
            const foundMovie = await movieService.getMovieById(movieId as string); // USANDO AWAIT

            if (foundMovie && foundMovie.isExternal) {
              setMovie(foundMovie);
              const movieReviews = await reviewService.getReviewsByMovieId(foundMovie.id); // USANDO AWAIT
              setReview(movieReviews.length > 0 ? movieReviews[0] : null);
            } else {
              Alert.alert('Erro', 'Filme não encontrado ou não é um filme externo.');
              router.back();
            }
          } catch (error) {
            console.error("Erro ao carregar detalhes do filme externo:", error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do filme.');
            router.back();
          }
        }
        setLoading(false);
      };
      loadMovieDetailsAndReview(); 
    }, [movieId, movieService, reviewService]) // Adicionado reviewService como dependência
  );

  const handleEditMovie = () => {
    if (movie) {
      router.push({
        pathname: "/telas/EditarFilmeExterno", 
        params: { movieId: movie.id }, 
      });
    }
  };

  const handleAvaliacao = () => {
    if (movie) {
      router.push({
        pathname: "/telas/CriarAvaliacao",
        params: { movieId: movie.id },
      });
    }
  };

  // NOVO: Função para deletar a avaliação em filmes externos
  const handleDeleteReview = async () => {
    if (!review) return;

    Alert.alert(
      "Excluir Avaliação",
      "Tem certeza que deseja excluir esta avaliação?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: async () => { // Usando async aqui também
            try {
              await reviewService.deleteReview(review.id); // USANDO AWAIT
              setReview(null); 
              Alert.alert("Sucesso", "Sua avaliação foi removida.");

              // ATUALIZA O STATUS DO FILME NO MovieService LOCALMENTE
              const movieToUpdate = await movieService.getMovieById(movie?.id as string); // Precisa de await
              if (movieToUpdate) {
                  movieToUpdate.status = null;
                  movieService.updateMovie(movieToUpdate);
              }

            } catch (error) {
                console.error("Erro ao deletar avaliação:", error);
                Alert.alert("Erro", "Não foi possível remover sua avaliação.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  if (loading || !movie) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3E9C9C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={detalhesExternoStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesExternoStyles.headerTitle} numberOfLines={1}>
          Detalhes do Filme Externo
        </Text>
        <Pressable onPress={handleEditMovie}>
            <AntDesign name="edit" size={24} color="#eaeaea" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={detalhesExternoStyles.scrollViewContent}>
        {movie.posterUrl ? (
          <Image source={{ uri: movie.posterUrl }} style={detalhesExternoStyles.moviePoster} />
        ) : (
          <View style={detalhesExternoStyles.placeholderPoster}>
            <Text style={detalhesExternoStyles.placeholderText}>{movie.title}</Text>
          </View>
        )}

        <Text style={detalhesExternoStyles.title}>{movie.title}</Text>
        <Text style={detalhesExternoStyles.subtitle}>
          {movie.releaseYear}{movie.genre && ` • ${movie.genre}`} {movie.duration && ` • ${movie.duration} min`}
        </Text>

        <Text style={detalhesExternoStyles.sectionTitle}>Sinopse:</Text>
        <Text style={detalhesExternoStyles.sinopseText}>{movie.overview || 'Sinopse não disponível.'}</Text> 
        
        <Text style={detalhesExternoStyles.sectionTitle}>Sua Avaliação:</Text>
        {review ? (
            <View style={detalhesExternoStyles.reviewContainer}>
                <AntDesign 
                    name={review.reviewType === 'like' ? 'like2' : review.reviewType === 'dislike' ? 'dislike2' : 'staro'} 
                    size={24} 
                    color="#3E9C9C" 
                />
                <Text style={detalhesExternoStyles.reviewContent}>{review.content || 'Sem comentário adicional.'}</Text>
                <Pressable onPress={handleDeleteReview} style={detalhesExternoStyles.deleteButton}> {/* Botão de delete */}
                    <AntDesign name="delete" size={20} color="#FF6347" />
                </Pressable>
            </View>
        ) : (
            <Text style={detalhesExternoStyles.noReviewText}>Você ainda não avaliou este filme.</Text>
        )}

        {review && <ComentariosColapsaveis avaliacaoId={review.id || ''} />} 
        
        <Pressable style={detalhesExternoStyles.evaluateButton} onPress={handleAvaliacao}>
          <AntDesign name="staro" size={20} color="#eaeaea" />
          <Text style={detalhesExternoStyles.evaluateButtonText}>{review ? 'Editar Avaliação' : 'Avaliar Filme'}</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

export default DetalhesFilmeExterno;

const detalhesExternoStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#2E3D50",
  },
  headerTitle: {
    color: "#eaeaea",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginHorizontal: 15,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  moviePoster: { 
    width: 200, 
    height: 300, 
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  placeholderPoster: { 
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#4A6B8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  placeholderText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: { 
    color: '#eaeaea',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: { 
    color: '#b0b0b0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: { 
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    alignSelf: 'flex-start', 
  },
  sinopseText: { 
    color: '#ccc',
    fontSize: 14,
    textAlign: 'left', 
    marginBottom: 10,
    width: '100%', 
  },
  reviewContainer: { 
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1A2B3E',
      borderRadius: 8,
      padding: 10,
      width: '100%',
      marginTop: 15,
      marginBottom: 10,
  },
  reviewContent: {
      color: '#eaeaea',
      fontSize: 14,
      marginLeft: 10,
      flexShrink: 1, 
  },
  // NOVO: Estilo para o botão de deletar na review
  deleteButton: {
      padding: 8, // Aumenta a área clicável
  },
  noReviewText: {
      color: '#b0b0b0',
      fontSize: 14,
      width: '100%',
      marginBottom: 10,
  },
  evaluateButton: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3E9C9C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  evaluateButtonText: {
    color: "#eaeaea",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
});