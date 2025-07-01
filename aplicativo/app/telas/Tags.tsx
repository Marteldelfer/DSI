// SUBSTITUA O CONTEÚDO DE: aplicativo/app/telas/DetalhesFilme.tsx
import {
  Movie,
  Avaliacao,
  getMovieById,
  getComentariosByAvaliacaoId,
  createComentario,
  getAvaliacoesByMovieId,
  Comentario,
  Tags,
  getTagsbyMovieandUsuario,
} from "@/utils/mockData";
import {
  Alert,
  View,
  Pressable,
  Text,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "@/app/styles";
import { useState, useCallback } from "react";
import { getAuth } from "firebase/auth";


export default function DetalhesFilme() {
  const { movieId } = useLocalSearchParams();
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  const [tags, setTags] = useState<Tags | undefined>(undefined);
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
            Alert.alert("Erro", "Falha ao reconhecer o login.");
            router.back();
        } else {
      const fetchMovieData = async () => {
        setLoading(true);
        if (movieId) {
          const foundMovie = await getMovieById(movieId as string);
          if (foundMovie) {
            setMovie(foundMovie);
             setTags(getTagsbyMovieandUsuario(foundMovie, user));
          } else {
            Alert.alert("Erro", "Filme não encontrado.");
            router.back();
          }
        }
        setLoading(false);
      }
      fetchMovieData();
    }}, [movieId])
  );
  
  if (loading || !movie) {
    return (
        <View style={styles.container}>
      <View style={detalhesFilme.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
      </View>
        <View style={[styles.container, {justifyContent: 'center'}]}>
            <ActivityIndicator size="large" color="#3E9C9C" />
        </View>
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={detalhesFilme.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesFilme.headerTitle} numberOfLines={1}>
          {movie.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={detalhesFilme.scrollViewContent}>
        

    <Text>Testando tela</Text>
        
      </ScrollView>
    </View>
  );
}

const detalhesFilme = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#1A2B3E",
  },
  headerTitle: {
    color: "#eaeaea",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: "center",
  },
  moviePoster: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
  },
  detailsContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#1A2B3E',
    borderRadius: 10,
    marginBottom: 20,
  },
  movieTitle: {
    color: '#eaeaea',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  overview: {
    color: '#ccc',
    fontSize: 15,
    textAlign: 'justify',
  },
  sectionTitle: {
    color: "#eaeaea",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
});