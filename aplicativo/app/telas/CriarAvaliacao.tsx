// aplicativo/app/telas/CriarAvaliacao.tsx
import { Alert, View, Pressable, Text, ScrollView, Image, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";

import { styles } from "@/app/styles"; 
import { Movie, MovieStatus } from '../../src/models/Movie'; 
import { Review, ReviewType } from '../../src/models/Review'; 
import { MovieService } from '../../src/services/MovieService';
import { ReviewService } from '../../src/services/ReviewService';


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
    }, [movieId, movieService])
  );

	// ALTERADO: Tornando a função assíncrona e usando await
	async function handleCriarAvaliacao() {
		if (reviewType === null) {
			Alert.alert("Erro", "Uma avaliação (gostei, não gostei ou favorito) é necessária.");
			return;
		}
		
        try {
            await reviewService.createReview({ // USANDO AWAIT
                movieId: movieId as string,
                content: content, 
                reviewType: reviewType
            });

            // ATUALIZA O STATUS DO FILME NO MovieService LOCALMENTE APÓS SALVAR NO FIRESTORE
            const movieToUpdate = movieService.getMovieById(movieId as string); // Obtém o filme do cache local
            if (movieToUpdate) {
                let status: MovieStatus = null;
                if (reviewType === 'like') status = 'like2';
                if (reviewType === 'dislike') status = 'dislike2';
                if (reviewType === 'favorite') status = 'staro';
                
                movieToUpdate.then(m => { // Como getMovieById é async, precisa de .then
                    if (m) {
                        m.status = status;
                        movieService.updateMovie(m); // Atualiza o status no cache local
                    }
                });
            }

            Alert.alert("Sucesso", "Sua avaliação foi publicada!");
            router.back();
        } catch (error) {
            console.error("Erro ao criar avaliação:", error);
            Alert.alert("Erro", "Não foi possível publicar sua avaliação.");
        }
	}

  if (loading || !movie) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#3E9C9C" />
        </View>
    );
  }

  // Função auxiliar para renderizar o pôster
  const renderMoviePoster = () => {
    if (movie?.posterUrl) {
      return <Image source={{ uri: movie.posterUrl }} style={criarAvaliacao.moviePoster} />;
    } else {
      // NOVO: Pôster genérico para filmes sem foto
      return (
        <View style={criarAvaliacao.genericPosterPlaceholder}>
          <Text style={criarAvaliacao.genericPosterText} numberOfLines={2}>
            {movie?.title}
            {movie?.releaseYear ? ` (${movie.releaseYear})` : ''}
          </Text>
        </View>
      );
    }
  };

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
        {renderMoviePoster()} {/* Usa a função auxiliar */}

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
  // NOVO: Estilos para o pôster genérico
  genericPosterPlaceholder: {
    width: 150,
    height: 225, // Proporções 2:3
    borderRadius: 12,
    backgroundColor: '#4A6B8A', // Fundo azulado
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  genericPosterText: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avaliacaoTitle: { color: "#eaeaea", fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 10, alignSelf: "center", },
  avaliacaoContainer: { flexDirection: "row", justifyContent: "space-around", width: "80%", marginBottom: 20, },
  avaliacaoButton: { backgroundColor: "#1A2B3E", padding: 15, borderRadius: 50, borderWidth: 2, borderColor: "#4A6B8A", },
  avaliacaoButtonSelected: { backgroundColor: "#3E9C9C", borderColor: "#3E9C9C", },
  saveButton: { backgroundColor: "#3E9C9C", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginTop: 30, width: "80%", alignItems: "center", },
});