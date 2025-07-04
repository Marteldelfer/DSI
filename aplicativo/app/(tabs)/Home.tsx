// aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert, // CORREÇÃO: Adicione esta importação
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { styles } from '../styles'; // Seus estilos globais

// Importe as novas classes e serviços
import { Movie, MovieStatus } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
// CORREÇÃO: Importar getPopularMovies do tmdb
import { getPopularMovies, searchMovies } from '../../src/api/tmdb';

function HomeScreen() {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  const movieService = MovieService.getInstance();

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // CORREÇÃO: Usar getPopularMovies
      const moviesFromApi = await getPopularMovies();
      const processedMovies: Movie[] = [];
      for (const apiMovieData of moviesFromApi) {
        // movieService.addMovieToLocalStore já cuida da instanciação de Movie
        // então passamos apenas os dados, e a função MovieService.addMovieToLocalStore
        // criará a instância da classe Movie internamente.
        // Ou, se transformApiMovieToLocalMovie já retorna uma instância de Movie:
        movieService.addMovieToLocalStore(apiMovieData); // O tmdb.ts já retorna Movie instanciado
        processedMovies.push(apiMovieData);
      }
      setTrendingMovies(processedMovies);
    } catch (error) {
      console.error("Erro ao buscar filmes populares:", error);
      Alert.alert("Erro", "Não foi possível carregar os filmes em destaque.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [movieService]);

  useFocusEffect(
    useCallback(() => {
      fetchMovies();
    }, [fetchMovies])
  );

  const onRefresh = useCallback(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      try {
        const query = searchTerm.toLowerCase();
        const cachedResults = movieService.getAllMovies().filter(movie =>
          movie.title.toLowerCase().includes(query)
        );
        setSearchResults(cachedResults);

        // Se quiser buscar na API TMDB também:
        const apiSearchResults = await searchMovies(searchTerm);
        // Adicione os resultados da API ao cache local e combine-os ou exiba separadamente
        apiSearchResults.forEach(movie => movieService.addMovieToLocalStore(movie));
        setSearchResults(prev => {
          const combined = [...prev];
          apiSearchResults.forEach(apiMovie => {
            if (!combined.some(m => m.id === apiMovie.id)) {
              combined.push(apiMovie);
            }
          });
          return combined;
        });

      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        Alert.alert("Erro", "Não foi possível realizar a busca.");
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, movieService]);

  const handleAvaliacao = (movieId: string) => {
    router.push({
      pathname: "/telas/CriarAvaliacao",
      params: { movieId: movieId },
    });
  };

  const navigateToMovieDetails = (movieId: string) => {
    router.push({
      pathname: `/telas/DetalhesFilme`,
      params: { movieId: movieId },
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#3E9C9C" />
      </View>
    );
  }

  const moviesToDisplay = searchTerm.trim() ? searchResults : trendingMovies;

  return (
    <View style={styles.container}>
      <View style={homeStyles.header}>
        <Text style={homeStyles.headerTitle}>Filme.ia</Text>
      </View>

      <View style={homeStyles.searchContainer}> {/* CORREÇÃO: Usar homeStyles */}
        <AntDesign name="search1" size={20} color="#7f8c8d" style={homeStyles.searchIcon} /> {/* CORREÇÃO: Usar homeStyles */}
        <TextInput
          placeholder="Buscar filmes..."
          placeholderTextColor="#7f8c8d"
          style={homeStyles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
      </View>

      <ScrollView
        style={homeStyles.mainContentScroll}
        contentContainerStyle={homeStyles.mainContentScrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
        }
      >
        {moviesToDisplay.length > 0 ? (
          <FlatList
            data={moviesToDisplay}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item: movie }) => (
              <Pressable
                style={homeStyles.movieCard}
                onPress={() => navigateToMovieDetails(movie.id)}
              >
                {movie.posterUrl ? (
                  <Image source={{ uri: movie.posterUrl }} style={homeStyles.moviePoster} />
                ) : (
                  <View style={homeStyles.moviePlaceholder}>
                    <Text style={homeStyles.moviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                  </View>
                )}
                <Text style={homeStyles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                <Pressable
                  style={homeStyles.evaluateButton}
                  onPress={() => handleAvaliacao(movie.id)}
                >
                  <AntDesign name="staro" size={20} color="#3E9C9C" />
                  <Text style={homeStyles.evaluateButtonText}>Avaliar</Text>
                </Pressable>
              </Pressable>
            )}
            contentContainerStyle={homeStyles.movieGrid}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={homeStyles.noMoviesText}>
            {searchTerm.trim() ? "Nenhum resultado para a busca." : "Nenhum filme em destaque para exibir."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

export default HomeScreen;

const homeStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#2E3D50",
    width: "100%",
    alignItems: "center",
  },
  headerTitle: {
    color: "#eaeaea",
    fontSize: 24,
    fontWeight: "bold",
  },
  // CORREÇÃO: Estilos de busca adicionados ou verificados aqui
  searchContainer: { // Novo estilo ou movido do global
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
    borderRadius: 25,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A6B8A',
  },
  searchIcon: { // Novo estilo ou movido do global
    marginRight: 10,
  },
  searchInput: { // Novo estilo ou movido do global
    flex: 1,
    color: '#eaeaea',
    fontSize: 16,
    height: 40,
  },
  mainContentScroll: {
    flex: 1,
    width: "100%",
  },
  mainContentScrollContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },
  movieGrid: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  movieCard: {
    backgroundColor: "#1A2B3E",
    borderRadius: 12,
    margin: 10,
    padding: 10,
    width: 160,
    alignItems: "center",
  },
  moviePoster: {
    width: 140,
    height: 210,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  moviePlaceholder: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: '#4A6B8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  moviePlaceholderText: {
    color: '#eaeaea',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  movieTitle: {
    color: "#eaeaea",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    height: 20,
  },
  evaluateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A6B8A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  evaluateButtonText: {
    color: "#eaeaea",
    marginLeft: 5,
    fontWeight: "bold",
  },
  noMoviesText: {
    color: '#eaeaea',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    width: '100%',
  },
});