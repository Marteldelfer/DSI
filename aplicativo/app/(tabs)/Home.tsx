// NOVO CONTEÚDO PARA: aplicativo/app/(tabs)/Home.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TextInput, Image, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { getPopularMovies, searchMovies, TMDBMovie, TMDB_IMAGE_BASE_URL } from '../../src/tmdbApi'; // Importar o serviço TMDB
import { MovieStatus } from '../../utils/mockData'; // Manter para o tipo de status

// Tipo simplificado para o filme a ser exibido nos componentes
interface DisplayMovie {
  id: string; // Convertido para string para consistência com mockData
  title: string;
  posterUrl: string | null;
  // Adicione outras propriedades se precisar exibi-las na lista
}

interface ComponenteFilmeProps {
  movie: DisplayMovie;
  onPress: (movie: DisplayMovie) => void;
}

function ComponenteFilme({ movie, onPress }: ComponenteFilmeProps) {
  const [clicado, setClicado] = useState(false);

  const estiloPequeno = { width: 100, height: 150, borderRadius: 12 };
  const estiloGrande = { width: 130, height: 195, borderRadius: 16 };

  return (
    <View style={homeStyles.movieWrapper}>
      <Pressable onPress={() => { setClicado(!clicado); onPress(movie); }}>
        <Image
          source={movie.posterUrl ? { uri: movie.posterUrl } : require("../../assets/images/filmeia-logo2.png")}
          style={clicado ? estiloGrande : estiloPequeno}
          resizeMode="cover"
        />
      </Pressable>
      
      <Text style={homeStyles.movieTitle} numberOfLines={2}>{movie.title}</Text>

      {/* Os ícones de interação podem ser movidos para a tela de detalhes se não forem mais para avaliação rápida na Home */}
      {/* Por enquanto, mantemos a lógica, mas eles não farão nada além de Alertar */}
      {clicado && (
        <View style={homeStyles.interactionIconsContainer}>
          <Pressable style={homeStyles.iconWrapper} onPress={() => Alert.alert("Funcionalidade", "Funcionalidade de avaliação será implementada na tela de detalhes do filme.")}>
            <AntDesign name="like2" size={20} color="black" />
          </Pressable>
          <Pressable style={homeStyles.iconWrapper} onPress={() => Alert.alert("Funcionalidade", "Funcionalidade de avaliação será implementada na tela de detalhes do filme.")}>
            <AntDesign name="dislike2" size={20} color="black" />
          </Pressable>
          <Pressable style={homeStyles.iconWrapper} onPress={() => Alert.alert("Funcionalidade", "Funcionalidade de avaliação será implementada na tela de detalhes do filme.")}>
            <AntDesign name="staro" size={20} color="black" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Home() {
  const [pesquisa, setPesquisa] = useState("");
  const [movies, setMovies] = useState<DisplayMovie[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para carregar filmes
  const loadMovies = async (query: string = '') => {
    setLoading(true);
    let fetchedMovies: TMDBMovie[] = [];
    if (query.trim() === '') {
      fetchedMovies = await getPopularMovies();
    } else {
      fetchedMovies = await searchMovies(query);
    }

    // Mapear os filmes do TMDB para o formato DisplayMovie
    const displayMovies: DisplayMovie[] = fetchedMovies.map(tmdbMovie => ({
      id: tmdbMovie.id.toString(), // Converter o ID numérico do TMDB para string
      title: tmdbMovie.title,
      posterUrl: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}` : null,
      // Você pode adicionar mais campos aqui conforme necessário
    }));

    setMovies(displayMovies);
    setLoading(false);
  };

  // Carregar filmes populares ao montar o componente
  useEffect(() => {
    loadMovies();
  }, []);

  // Recarregar filmes quando o termo de pesquisa mudar
  useEffect(() => {
    const handler = setTimeout(() => {
        loadMovies(pesquisa);
    }, 500); // Debounce para não pesquisar a cada letra

    return () => clearTimeout(handler);
  }, [pesquisa]);

  const handleMoviePress = (movie: DisplayMovie) => {
    // Implementar a navegação para a tela de detalhes do filme do TMDB
    // Por exemplo: router.push(`/telas/DetalhesFilmeTMDB?id=${movie.id}`);
    Alert.alert(`Detalhes de ${movie.title}`, "Em breve: navegação para a tela de detalhes do filme do TMDB.");
  };

  return (
    <View style={styles.container}>
      <View style={{width: '100%', paddingHorizontal: 20, marginTop: 36, flex: 1, paddingBottom: 70}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={require("../../assets/images/filmeia-logo2.png")} style={homeStyles.logo} />
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={36} color="black" />
            <TextInput
              placeholder="Pesquisar Filmes"
              style={styles.input}
              placeholderTextColor={"black"}
              onChangeText={setPesquisa}
              value={pesquisa}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 20 }} />
          ) : (
            <View style={homeStyles.sectionContainer}>
              <Text style={homeStyles.sectionTitle}>
                {pesquisa ? `Resultados para "${pesquisa}"` : "Recomendações (Populares)"}
              </Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {movies.length > 0 ? (
                  movies.map((movie) => (
                    <ComponenteFilme key={movie.id} movie={movie} onPress={handleMoviePress} />
                  ))
                ) : (
                  <Text style={homeStyles.noResultsText}>Nenhum filme encontrado.</Text>
                )}
              </ScrollView>
            </View>
          )}

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
    },
    noResultsText: {
        color: '#eaeaea',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        width: '100%',
    }
});

export default Home;