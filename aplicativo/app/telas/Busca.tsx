// aplicativo/app/telas/Busca.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { Movie } from '../../src/models/Movie';
import { searchMovies } from '../../src/api/tmdb';
import { MovieService } from '../../src/services/MovieService';

export default function TelaBusca() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();

  const [searchTerm, setSearchTerm] = useState(params.query || '');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  const movieService = MovieService.getInstance();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const apiResults = await searchMovies(query);
      apiResults.forEach((movie: Movie) => movieService.addMovieToLocalStore(movie));
      setResults(apiResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca.');
    } finally {
      setLoading(false);
    }
  }, [movieService]);

  useEffect(() => {
    if (params.query && !initialSearchDone) {
      handleSearch(params.query);
      setInitialSearchDone(true);
    }
  }, [params.query, handleSearch, initialSearchDone]);

  // Efeito para buscar enquanto o usuário digita (com debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (initialSearchDone) { // Só busca automaticamente após a busca inicial
        handleSearch(searchTerm);
      }
    }, 300); // Aguarda 300ms após o usuário parar de digitar

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, handleSearch, initialSearchDone]);


  const navigateToMovieDetails = (movie: Movie) => {
    movieService.addMovieToLocalStore(movie);
    router.push({
      pathname: '/telas/DetalhesFilmeTMDB',
      params: { movieId: movie.id },
    });
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <Pressable style={buscaStyles.card} onPress={() => navigateToMovieDetails(item)}>
      {item.posterUrl ? (
        <Image source={{ uri: item.posterUrl }} style={buscaStyles.poster} />
      ) : (
        <View style={buscaStyles.placeholder}>
          <Text style={buscaStyles.placeholderText}>{item.title}</Text>
        </View>
      )}
      <View style={buscaStyles.info}>
        <Text style={buscaStyles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={buscaStyles.year}>{item.releaseYear || 'Ano não informado'}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={buscaStyles.header}>
        <Pressable onPress={() => router.back()} style={buscaStyles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>
        <View style={buscaStyles.searchContainer}>
          <AntDesign name="search1" size={20} color="#7f8c8d" style={buscaStyles.searchIcon} />
          <TextInput
            placeholder="Pesquisar Filmes"
            placeholderTextColor="#7f8c8d"
            style={buscaStyles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => handleSearch(searchTerm)}
            returnKeyType="search"
            autoFocus={true} // Foca no input ao abrir a tela
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={buscaStyles.list}
          ListEmptyComponent={
            <View style={buscaStyles.emptyContainer}>
              <Text style={buscaStyles.emptyText}>
                {params.query ? 'Nenhum resultado encontrado.' : 'Digite algo para buscar.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const buscaStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#2E3D50',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    height: '100%',
  },
  list: {
    paddingHorizontal: 5,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1A2B3E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: 250,
  },
  placeholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#4A6B8A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  placeholderText: {
    color: '#eaeaea',
    textAlign: 'center',
  },
  info: {
    padding: 10,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  year: {
    color: '#b0b0b0',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#b0b0b0',
    fontSize: 16,
  },
});