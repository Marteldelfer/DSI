import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles'; 
import { Movie } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService'; 
import { Review } from '../../src/models/Review';
import { ReviewService } from '../../src/services/ReviewService';
import ComentariosColapsaveis from '../../src/componentes/ComentariosColapsaveis'; 
// A importação de fetchTmdbMovieDetails não é mais necessária aqui, pois MovieService.getMovieById já a utiliza internamente.
// import { getMovieDetails as fetchTmdbMovieDetails } from '../../src/api/tmdb'; 

function DetalhesFilmeTMDB() { 
  const router = useRouter();
  const { movieId } = useLocalSearchParams();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);

  const movieService = MovieService.getInstance();
  const reviewService = ReviewService.getInstance();

  const handleDeleteReview = async () => {
    if (!review) return;

    Alert.alert(
      "Excluir Avaliação",
      "Tem certeza que deseja excluir esta avaliação?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: async () => {
            try {
              await reviewService.deleteReview(review.id);
              setReview(null); 
              Alert.alert("Sucesso", "Sua avaliação foi removida.");

              const movieToUpdate = await movieService.getMovieById(movie?.id as string);
              if (movieToUpdate) {
                  movieToUpdate.status = null;
                  await movieService.updateMovie(movieToUpdate); 
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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => { 
        setLoading(true);
        if (typeof movieId === 'string') {
          try {
            // Agora, dependemos apenas de movieService.getMovieById para buscar o filme,
            // que internamente cuidará de buscar no Firestore, cache local ou TMDB.
            const foundMovie = await movieService.getMovieById(movieId); 
            
            if (foundMovie) {
              setMovie(foundMovie);
              const movieReviews = await reviewService.getReviewsByMovieId(foundMovie.id); 
              setReview(movieReviews.length > 0 ? movieReviews[0] : null);
            } else {
              Alert.alert('Erro', 'Filme não encontrado ou detalhes não disponíveis.');
              router.back();
            }
          } catch (error) {
            console.error("Erro ao carregar dados do filme/avaliação:", error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do filme ou sua avaliação.');
            router.back();
          }
        }
        setLoading(false);
      };
      loadData();
    }, [movieId, movieService, reviewService, router])
  );

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
      <View style={detalhesTmdbStyles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesTmdbStyles.headerTitle} numberOfLines={1}>
          Detalhes do Filme
        </Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={detalhesTmdbStyles.scrollViewContent}>
        {movie.posterUrl ? (
          <Image source={{ uri: movie.posterUrl }} style={detalhesTmdbStyles.moviePoster} />
        ) : (
          <View style={detalhesTmdbStyles.placeholderPoster}>
            <Text style={detalhesTmdbStyles.placeholderText}>{movie.title}</Text>
          </View>
        )}

        <Text style={detalhesTmdbStyles.title}>{movie.title}</Text>
        <Text style={detalhesTmdbStyles.subtitle}>
          {movie.releaseYear}{movie.genre && ` • ${movie.genre}`} {movie.duration && ` • ${movie.duration} min`}
        </Text>

        <Text style={detalhesTmdbStyles.sectionTitle}>Sinopse:</Text>
        <Text style={detalhesTmdbStyles.text}>{movie.overview || 'Sinopse não disponível.'}</Text>

        <Text style={detalhesTmdbStyles.sectionTitle}>Sua Avaliação:</Text>
        {review ? (
            <View style={detalhesTmdbStyles.reviewContainer}>
                <AntDesign 
                    name={review.reviewType === 'like' ? 'like2' : review.reviewType === 'dislike' ? 'dislike2' : 'staro'} 
                    size={24} 
                    color="#3E9C9C" 
                />
                <Text style={detalhesTmdbStyles.reviewContent}>{review.content || 'Sem comentário adicional.'}</Text>
                <Pressable onPress={handleDeleteReview} style={detalhesTmdbStyles.deleteButton}>
                    <AntDesign name="delete" size={20} color="#FF6347" />
                </Pressable>
            </View>
        ) : (
            <Text style={detalhesTmdbStyles.noReviewText}>Você ainda não avaliou este filme.</Text>
        )}

        {review && <ComentariosColapsaveis avaliacaoId={review.id || ''} />} 
        
        <Pressable style={detalhesTmdbStyles.evaluateButton} onPress={handleAvaliacao}>
          <AntDesign name="staro" size={20} color="#eaeaea" />
          <Text style={detalhesTmdbStyles.evaluateButtonText}>{review ? 'Editar Avaliação' : 'Avaliar Filme'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default DetalhesFilmeTMDB; 

const detalhesTmdbStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, backgroundColor: "#2E3D50" },
  headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", flex: 1, marginHorizontal: 15 },
  scrollViewContent: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  moviePoster: { width: 200, height: 300, borderRadius: 12, marginBottom: 20, resizeMode: 'cover' },
  placeholderPoster: { width: 200, height: 300, borderRadius: 12, backgroundColor: '#4A6B8A', justifyContent: 'center', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  placeholderText: { color: '#eaeaea', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  title: { color: '#eaeaea', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { color: '#b0b0b0', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  sectionTitle: { color: '#eaeaea', fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, alignSelf: 'flex-start' },
  text: { color: '#ccc', fontSize: 14, textAlign: 'justify', marginBottom: 10 },
  reviewContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2B3E', borderRadius: 8, padding: 10, width: '100%', marginBottom: 10 },
  reviewContent: { color: '#eaeaea', fontSize: 14, marginLeft: 10, flex: 1 },
  deleteButton: { padding: 8, },
  noReviewText: { color: '#b0b0b0', fontSize: 14, width: '100%', marginBottom: 10 },
  evaluateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#3E9C9C", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, marginTop: 20 },
  evaluateButtonText: { color: "#eaeaea", marginLeft: 10, fontWeight: "bold", fontSize: 16 },
});
