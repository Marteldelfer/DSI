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
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { styles } from '../styles'; // Seus estilos globais

// Importe as novas classes e serviços
import { Movie } from '../../src/models/Movie';
import { MovieService } from '../../src/services/MovieService';
import { getPopularMovies, searchMovies } from '../../src/api/tmdb'; //

// Importar a logo localmente
import FilmeiaLogo from '../../assets/images/filmeia-logo2.png'; //

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
      const moviesFromApi = await getPopularMovies(); //
      const processedMovies: Movie[] = [];
      for (const apiMovieData of moviesFromApi) {
        movieService.addMovieToLocalStore(apiMovieData);
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

  const performSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const cachedResults = movieService.getAllMovies().filter(movie =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        );
        let combinedResults = [...cachedResults];

        const apiSearchResults = await searchMovies(query); //
        apiSearchResults.forEach(apiMovie => {
          movieService.addMovieToLocalStore(apiMovie);
          if (!combinedResults.some(m => m.id === apiMovie.id)) {
            combinedResults.push(apiMovie);
          }
        });
        
        setSearchResults(combinedResults);
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        Alert.alert("Erro", "Não foi possível realizar a busca.");
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [movieService]);

  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);


  const handleAvaliacao = (movieId: string) => {
    const movieToEvaluate = trendingMovies.find(m => m.id === movieId) || searchResults.find(m => m.id === movieId);
    if (movieToEvaluate) {
        movieService.addMovieToLocalStore(movieToEvaluate);
    }
    router.push({
      pathname: "/telas/CriarAvaliacao",
      params: { movieId: movieId },
    });
  };

  const navigateToMovieDetails = (movieId: string) => {
    const movieToDetail = trendingMovies.find(m => m.id === movieId) || searchResults.find(m => m.id === movieId);
    if (movieToDetail) {
        movieService.addMovieToLocalStore(movieToDetail);
    }
    router.push({
      pathname: `/telas/DetalhesFilme`,
      params: { movieId: movieId },
    });
  };

  // CORREÇÃO: Mova a declaração de moviesToDisplay para antes do `if`
  const moviesToDisplay = searchTerm.trim() ? searchResults : trendingMovies;

  if (loading && !refreshing && moviesToDisplay.length === 0 && !searchTerm.trim()) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#3E9C9C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={homeStyles.header}>
        <View style={{width: 24, height: 24, marginLeft: 20}} />
        <Image source={FilmeiaLogo} style={homeStyles.headerLogo} />
        <View style={{width: 24, height: 24, marginRight: 20}} />
      </View>

      <View style={homeStyles.searchContainer}>
        <AntDesign name="search1" size={20} color="#7f8c8d" style={homeStyles.searchIcon} />
        <TextInput
          placeholder="Pesquisar Filmes no TMDB"
          placeholderTextColor="#7f8c8d"
          style={homeStyles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView
        style={homeStyles.mainContentScroll}
        contentContainerStyle={homeStyles.mainContentScrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E9C9C" />
        }
      >
        <View style={homeStyles.sectionContainer}>
          <Text style={homeStyles.sectionTitle}>{searchTerm.trim() && moviesToDisplay.length > 0 ? `Resultados para "${searchTerm}"` : "Recomendações"}</Text>
          {loading && searchTerm.trim() ? (
            <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }} />
          ) : moviesToDisplay.length > 0 ? (
            <FlatList
              data={moviesToDisplay}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item: movie }) => (
                <View style={homeStyles.movieCard}>
                    <Pressable onPress={() => navigateToMovieDetails(movie.id)}>
                        {movie.posterUrl ? (
                            <Image source={{ uri: movie.posterUrl }} style={homeStyles.moviePoster} />
                        ) : (
                            <View style={homeStyles.moviePlaceholder}>
                                <Text style={homeStyles.moviePlaceholderText} numberOfLines={2}>{movie.title}</Text>
                            </View>
                        )}
                        <Text style={homeStyles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                    </Pressable>
                    <Pressable
                        style={homeStyles.evaluateButton}
                        onPress={() => handleAvaliacao(movie.id)}
                    >
                        <AntDesign name="staro" size={20} color="#3E9C9C" />
                        <Text style={homeStyles.evaluateButtonText}>Avaliar</Text>
                    </Pressable>
                </View>
              )}
              contentContainerStyle={homeStyles.movieGrid}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <Text style={homeStyles.noMoviesText}>
              {searchTerm.trim() ? "Nenhum resultado para a busca." : "Nenhum filme em destaque para exibir."}
            </Text>
          )}
        </View>

        {/* Perfil Cinematográfico */}
        <View style={homeStyles.sectionContainer}>
          <Text style={homeStyles.sectionTitle}>Seu Perfil Cinematográfico</Text>
          <Image source={require("../../assets/images/stats.png")} style={homeStyles.profileStatsImage} />
        </View>
      </ScrollView>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#2E3D50",
    width: "100%",
  },
  headerLogo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  headerTitle: {
    color: "#eaeaea",
    fontSize: 24,
    fontWeight: "bold",
    position: 'absolute',
    opacity: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
    borderRadius: 25,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#4A6B8A',
  },
  searchIcon: {
    marginRight: 10,
    color: '#7f8c8d',
  },
  searchInput: {
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
  sectionContainer: {
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#eaeaea",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
  },
  movieGrid: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
    width: '100%',
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
  profileStatsImage: {
    width: '100%',
    height: 150,
    resizeMode: "contain",
    alignSelf: 'center',
    marginBottom: 10,
  },
  noMoviesText: {
    color: '#eaeaea',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    width: '100%',
  },
});

export default HomeScreen;