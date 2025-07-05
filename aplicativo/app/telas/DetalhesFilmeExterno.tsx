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
      const loadMovieDetailsAndReview = async () => {
        setLoading(true);
        if (movieId) {
          try {
            const foundMovie = await movieService.getMovieById(movieId as string);

            if (foundMovie && foundMovie.isExternal) {
              setMovie(foundMovie);
              const movieReviews = reviewService.getReviewsByMovieId(foundMovie.id);
              if (movieReviews.length > 0) {
                  setReview(movieReviews[0]);
              } else {
                  setReview(null);
              }
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
    }, [movieId, movieService, reviewService])
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
        <Text style={detalhesExternoStyles.sinopseText}>{movie.overview || 'Sinopse não disponível.'}</Text> {/* CORREÇÃO: Usar sinopseText */}

        {/* REMOVIDO: Campo Diretor */}
        {/* {movie.director && (
          <>
            <Text style={detalhesExternoStyles.sectionTitle}>Diretor:</Text>
            <Text style={detalhesExternoStyles.text}>{movie.director}</Text>
          </>
        )} */}
        
        <Text style={detalhesExternoStyles.sectionTitle}>Sua Avaliação:</Text>
        {review ? (
            <View style={detalhesExternoStyles.reviewContainer}>
                <AntDesign 
                    name={review.reviewType === 'like' ? 'like2' : review.reviewType === 'dislike' ? 'dislike2' : 'staro'} 
                    size={24} 
                    color="#3E9C9C" 
                />
                <Text style={detalhesExternoStyles.reviewContent}>{review.content || 'Sem comentário adicional.'}</Text>
            </View>
        ) : (
            <Text style={detalhesExternoStyles.noReviewText}>Você ainda não avaliou este filme.</Text>
        )}

        {review && <ComentariosColapsaveis avaliacaoId={review.id || ''} />} 
        
        <Pressable style={detalhesExternoStyles.evaluateButton} onPress={handleAvaliacao}>
          <AntDesign name="staro" size={20} color="#eaeaea" />
          <Text style={detalhesExternoStyles.evaluateButtonText}>Avaliar Filme</Text>
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
  // CORREÇÃO: Novo estilo para a sinopse alinhada à esquerda
  sinopseText: { 
    color: '#ccc',
    fontSize: 14,
    textAlign: 'left', // Alinhado à esquerda
    marginBottom: 10,
    width: '100%', // Ocupa toda a largura para o alinhamento funcionar
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