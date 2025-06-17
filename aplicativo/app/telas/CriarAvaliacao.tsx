import {
  Movie,
  Avaliacao,
  getAvaliacoes,
  getAvaliacaoById,
  createAvaliacao,
  deleteAvaliacao,
  updateAvaliacao,
  getMovieById,
} from "@/utils/mockData";
import {
  Alert,
  KeyboardAvoidingView,
  View,
  Pressable,
  Text,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "@/app/styles";
import { useState, useCallback } from "react";

export default function CriarAvaliacao() {
  const { movieId, preReview } = useLocalSearchParams();
  const router = useRouter();

  const [review, setReview] = useState<"like" | "dislike" | "favorite" | null>(null);
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [content, setContent] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (movieId) {
        const foundMovie = getMovieById(movieId as string);
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          Alert.alert("Erro", "Filme não encontrado.");
          router.back();
        }
      }
    }, [movieId])
  );

	function handleCriarAvaliacao() {
		if (review === null) {
			Alert.alert("Erro", "Avaliação é nescessária");
			return;
		}
		createAvaliacao({
			movieId: movieId as string,
			content: content,
			review: review
		});
		router.back();
	}

  if (!movie) return;

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
        {movie.isExternal ? (
          <View style={criarAvaliacao.externalMoviePlaceholderLarge}>
            <Text style={criarAvaliacao.externalMovieTextLarge}>
              Filme Externo
            </Text>
          </View>
        ) : (
          <Image
            source={
              movie.posterUrl
                ? { uri: movie.posterUrl }
                : require("../../assets/images/filmeia-logo2.png")
            }
            style={criarAvaliacao.moviePoster}
          />
        )}

				<Text style={styles.textoBotao}>O que você achou deste filme?</Text>
        <View style={[styles.textInput, { height: 120 }]}>
          <TextInput
            placeholder="Review"
            placeholderTextColor={"grey"}
            style={[styles.input, {height: 110, outline: "none"}]}
            multiline={true}
						onChangeText={(e) => setContent(e)}
          />
        </View>

        <Text style={criarAvaliacao.avaliacaoTitle}>Avaliação:</Text>
        <View style={criarAvaliacao.avaliacaoContainer}>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              review === "like" &&
                criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReview("like")}
          >
            <AntDesign
              name="like2"
              size={30}
              color={review === "like" ? "black" : "#eaeaea"}
            />
          </Pressable>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              review === "dislike" &&
                criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReview("dislike")}
          >
            <AntDesign
              name="dislike2"
              size={30}
              color={review === "dislike" ? "black" : "#eaeaea"}
            />
          </Pressable>
          <Pressable
            style={[
              criarAvaliacao.avaliacaoButton,
              review === "favorite" &&
                criarAvaliacao.avaliacaoButtonSelected,
            ]}
            onPress={() => setReview("favorite")}
          >
            <AntDesign
              name="staro"
              size={30}
              color={review === "favorite" ? "black" : "#eaeaea"}
            />
          </Pressable>
        </View>

        <Pressable
          style={criarAvaliacao.saveButton}
          onPress={handleCriarAvaliacao}
        >
          <Text style={styles.textoBotao}>Publicar Avaliação</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const criarAvaliacao = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
  },
  moviePoster: {
    width: 150,
    height: 225,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
  },
  externalMoviePlaceholderLarge: {
    // Para a tela de detalhes
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: "#666666", // Cor cinza
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  externalMovieTextLarge: {
    // Para a tela de detalhes
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  avaliacaoTitle: {
    color: "#eaeaea",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
  },
  avaliacaoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 20,
  },
  avaliacaoButton: {
    backgroundColor: "#1A2B3E",
    padding: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4A6B8A",
  },
  avaliacaoButtonSelected: {
    backgroundColor: "#3E9C9C",
    borderColor: "#3E9C9C",
  },
  saveButton: {
    backgroundColor: "#3E9C9C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
});
