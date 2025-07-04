// aplicativo/app/telas/DetalhesFilmeTMDB.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { styles } from '../styles'; // Seus estilos globais
import { Movie } from '../../src/models/Movie'; 
import { MovieService } from '../../src/services/MovieService'; 
import { getMovieDetails as fetchTmdbMovieDetails } from '../../src/api/tmdb'; //

function DetalhesFilmeTMDB() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  const movieService = MovieService.getInstance();

  useFocusEffect(
    useCallback(() => {
      const loadMovieDetails = async () => {
        setLoading(true);
        if (movieId) {
          try {
            let foundMovie = await movieService.getMovieById(movieId as string);

            // Mesmo com a versão anterior do tmdb.ts, ainda tentamos puxar os detalhes
            // para garantir que tenhamos o máximo de informações possível,
            // especialmente o `runtime` e o `genres` do objeto principal.
            const tmdbDetails = await fetchTmdbMovieDetails(movieId as string); 
            if (tmdbDetails) {
                // Atualiza o cache local com os detalhes completos retornados (mesmo sem créditos)
                movieService.addMovieToLocalStore(tmdbDetails);
                foundMovie = tmdbDetails; // Usa a versão mais detalhada
            }

            if (foundMovie) {
              setMovie(foundMovie);
            } else {
              Alert.alert('Erro', 'Filme não encontrado ou detalhes não disponíveis.');
              router.back();
            }
          } catch (error) {
            console.error("Erro ao carregar detalhes do filme TMDB:", error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do filme.');
            router.back();
          }
        }
        setLoading(false);
      };
      loadMovieDetails();
    }, [movieId, movieService])
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
        {/* Estrela no canto superior direito removida, pois já há um botão de avaliar no final da página */}
        <View style={{width: 24}} /> {/* Placeholder para manter alinhamento */}
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

        {/* Parte do diretor removida conforme solicitado */}
        {/* {movie.director && (
          <>
            <Text style={detalhesTmdbStyles.sectionTitle}>Diretor:</Text>
            <Text style={detalhesTmdbStyles.text}>{movie.director}</Text>
          </>
        )} */}

        <Pressable style={detalhesTmdbStyles.evaluateButton} onPress={handleAvaliacao}>
          <AntDesign name="staro" size={20} color="#eaeaea" />
          <Text style={detalhesTmdbStyles.evaluateButtonText}>Avaliar Filme</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

export default DetalhesFilmeTMDB;

const detalhesTmdbStyles = StyleSheet.create({
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
  text: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'justify',
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