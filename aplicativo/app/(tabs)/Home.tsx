// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, TextInput, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { useRouter } from "expo-router";
import { Movie } from "../../utils/mockData";
import { getPopularMovies, searchMovies } from '@/src/api/tmdb';
import { addMovieToLocalStore } from '@/utils/mockData';

function ComponenteFilme({ movie }: { movie: Movie }): React.JSX.Element {
  const [clicado, setClicado] = useState(false);
  const router = useRouter();

  const estiloPequeno = { width: 100, height: 150, borderRadius: 12 };
  const estiloGrande = { width: 130, height: 195, borderRadius: 16 };

  const handleInteraction = () => {
    // Garante que o filme esteja no nosso "banco de dados" local antes de interagir
    addMovieToLocalStore(movie);
    setClicado(true);
  }

  function handleNavigateToDetails() {
    addMovieToLocalStore(movie);
    router.push({
      pathname: '/telas/DetalhesFilme',
      params: { movieId: movie.id },
    });
  }
  
  function handleAvaliacao(r: "like" | "dislike" | "favorite") {
    addMovieToLocalStore(movie);
    router.push({
      pathname: '/telas/CriarAvaliacao',
      params: { movieId: movie.id, review: r },
    });
  };

  return (
    <View style={homeStyles.movieWrapper}>
      <Pressable onPress={() => !clicado ? handleInteraction() : handleNavigateToDetails()}>
        <Image
          source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")}
          style={clicado ? estiloGrande : estiloPequeno}
        />
      </Pressable>
      
      <Text style={homeStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>

      {clicado && (
        <View style={homeStyles.interactionIconsContainer}>
          <Pressable onPress={() => handleAvaliacao("like")}>
            <View style={homeStyles.iconWrapper}><AntDesign name="like2" size={20} color="black"/></View>
          </Pressable>
          <Pressable onPress={() => handleAvaliacao("dislike")}>
            <View style={homeStyles.iconWrapper}><AntDesign name="dislike2" size={20} color="black"/></View>
          </Pressable>
          <Pressable onPress={() => handleAvaliacao("favorite")}>
            <View style={homeStyles.iconWrapper}><AntDesign name="staro" size={20} color="black"/></View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Home() {
  const [pesquisa, setPesquisa] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    const moviesData = pesquisa ? await searchMovies(pesquisa) : await getPopularMovies();
    setMovies(moviesData);
    setLoading(false);
  }, [pesquisa]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchMovies();
    }, 500); // Debounce para a pesquisa
    
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  return (
    <View style={styles.container}>
      <View style={{width: '100%', paddingHorizontal: 20, marginTop: 36, flex: 1, paddingBottom: 70}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={require("../../assets/images/filmeia-logo2.png")} style={homeStyles.logo} />
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={24} color="black" style={{marginRight: 10}} />
            <TextInput 
              placeholder="Pesquisar Filmes no TMDB" 
              style={styles.input} 
              placeholderTextColor={"black"} 
              onChangeText={setPesquisa} 
              value={pesquisa} 
            />
          </View>
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>{pesquisa ? `Resultados para "${pesquisa}"` : "Recomendações"}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#3E9C9C" style={{marginTop: 20}} />
            ) : (
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {movies.map((movie) => <ComponenteFilme key={movie.id} movie={movie} />)}
              </ScrollView>
            )}
          </View>
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Seu Perfil Cinematográfico</Text>
            <Image source={require("../../assets/images/stats.png")} style={homeStyles.statsImage} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const homeStyles = StyleSheet.create({
    logo: { width: 300, height: 150, resizeMode: "contain", alignSelf: 'center' },
    sectionContainer: { marginVertical: 24 },
    sectionTitle: { color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8 },
    statsImage: { width: '100%', height: 80, resizeMode: "stretch", alignSelf: 'center' },
    movieWrapper: {
      width: 130,
      height: 280,
      alignItems: 'center',
      marginRight: 5,
    },
    movieTitle: { color: "#eaeaea", fontSize: 12, textAlign: 'center', marginTop: 8, width: 100, height: 30 },
    interactionIconsContainer: {
      flexDirection: "row",
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginTop: 8,
      gap: 12,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#3E9C9C",
      justifyContent: 'center',
      alignItems: 'center'
    }
});

export default Home;