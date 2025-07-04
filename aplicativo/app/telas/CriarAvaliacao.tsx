// aplicativo/app/telas/CriarAvaliacao.tsx
import { Alert, View, Pressable, Text, ScrollView, Image, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";

// Importe as novas classes e serviços
import { Movie, MovieStatus } from '../../src/models/Movie';
import { Review, ReviewType } from '../../src/models/Review';
import { MovieService } from '../../src/services/MovieService';
import { ReviewService } from '../../src/services/ReviewService';

import { styles } from "@/app/styles";

export default function CriarAvaliacao() {
  const { movieId, review: preReview } = useLocalSearchParams();
  const router = useRouter();

  const [reviewType, setReviewType] = useState<ReviewType | null>(
    preReview as ReviewType || null
  );
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const movieService = MovieService.getInstance();
  const reviewService = ReviewService.getInstance();

  useFocusEffect(
    useCallback(() => {
      const fetchMovie = async () => {
        setLoading(true);
        if (movieId) {
          const foundMovie = await movieService.getMovieById(movieId as string);
          if (foundMovie) {
            setMovie(foundMovie);
          } else {
            Alert.alert("Erro", "Filme não encontrado.");
            router.back();
          }
        }
        setLoading(false);
      };
      fetchMovie();
    }, [movieId, movieService]) // Adicionar movieService como dependência
  );

	function handleCriarAvaliacao() {
		if (reviewType === null) {
			Alert.alert("Erro", "Uma avaliação (gostei, não gostei ou favorito) é necessária.");
			return;
		}
		reviewService.createReview({
			movieId: movieId as string,
			content: content,
			reviewType: reviewType // Usar reviewType
		});
    Alert.alert("Sucesso", "Sua avaliação foi publicada!");
		router.back();
	}

  if (loading || !movie) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#3E9C9C" />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={criarAvaliacao.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={criarAvaliacao.headerTitle} numberOfLines={1}>
          Criar Avaliação
        </Text>
      </View>

      <ScrollView contentContainerStyle={criarAvaliacao.scrollViewContent}>
        <Image
          source={
            movie.posterUrl
              ? { uri: movie.posterUrl }
              : require("../../assets/images/filmeia-logo2.png")
          }
          style={criarAvaliacao.moviePoster}
        />

        <Text style={styles.textoBotao}>O que você achou de "{movie.title}"?</Text>
        <View style={[styles.textInput, {marginTop: 15}]}>
          <TextInput
            placeholder="Escreva um comentário (opcional)..."
            placeholderTextColor={"grey"}
            style={[styles.input, {height: 110, textAlignVertical: 'top', paddingTop: 10}]}
            multiline={true}
						onChangeText={setContent}
            value={content}
          />
        </View>

        <Text style={criarAvaliacao.avaliacaoTitle}>Avaliação:</Text>
        <View style={criarAvaliacao.avaliacaoContainer}>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              reviewType === "like" && criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReviewType("like")}
          >
            <AntDesign name="like2" size={30} color={reviewType === "like" ? "black" : "#eaeaea"} />
          </Pressable>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              reviewType === "dislike" && criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReviewType("dislike")}
          >
            <AntDesign name="dislike2" size={30} color={reviewType === "dislike" ? "black" : "#eaeaea"} />
          </Pressable>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              reviewType === "favorite" && criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReviewType("favorite")}
          >
            <AntDesign name="staro" size={30} color={reviewType === "favorite" ? "black" : "#eaeaea"} />
          </Pressable>
        </View>

        <Pressable style={criarAvaliacao.saveButton} onPress={handleCriarAvaliacao}>
          <Text style={styles.textoBotao}>Publicar Avaliação</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const criarAvaliacao = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 40,
    paddingBottom: 20, backgroundColor: "#1A2B3E",
  },
  headerTitle: { color: "#eaeaea", fontSize: 20, fontWeight: "bold", flex: 1, marginLeft: 15, },
  scrollViewContent: { padding: 20, paddingBottom: 100, alignItems: "center", },
  moviePoster: { width: 150, height: 225, borderRadius: 12, marginBottom: 20, resizeMode: "cover", },
  avaliacaoTitle: { color: "#eaeaea", fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 10, alignSelf: "center", },
  avaliacaoContainer: { flexDirection: "row", justifyContent: "space-around", width: "80%", marginBottom: 20, },
  avaliacaoButton: { backgroundColor: "#1A2B3E", padding: 15, borderRadius: 50, borderWidth: 2, borderColor: "#4A6B8A", },
  avaliacaoButtonSelected: { backgroundColor: "#3E9C9C", borderColor: "#3E9C9C", },
  saveButton: { backgroundColor: "#3E9C9C", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginTop: 30, width: "80%", alignItems: "center", },
});