import {
  Movie,
  Avaliacao,
  getAvaliacoes,
  getAvaliacaoById,
  createAvaliacao,
  deleteAvaliacao,
  updateAvaliacao,
  getMovieById,
  getComentariosByAvaliacaoId,
  createComentario,
  getAvaliacoesByMovieId,
  Comentario,
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
import { ComentariosColapsaveis } from "../componentes/ComentariosColapsaveis";

function AvaliacaoComponent({
  avaliacao,
}: {
  avaliacao: Avaliacao;
}): React.JSX.Element {
  const [respostas, setRespostas] = useState<Comentario[]>([]);
  const [responding, setResponding] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  const simbolos = new Map<string, string>();
  simbolos.set("like", "like2");
  simbolos.set("dislike", "dislike2");
  simbolos.set("favorite", "staro");


  useFocusEffect(
    useCallback(() => {
      handleGetResponses();
    }, [])
  );

  function handleGetResponses() {
    setRespostas(getComentariosByAvaliacaoId(avaliacao.id as string));
  }

  function handleResponding() {
    setResponding(!responding);
  }

  function handleCreateResponse() {
    createComentario(avaliacao.id as string, content);
    setResponding(false);
    handleGetResponses();
    console.log(avaliacao);
    console.log(respostas);
  }

  return (
    <>
      <Pressable onPress={handleResponding}>
        <View
          style={{
            backgroundColor: "#f2f2f2",
            padding: 10,
            margin: 12,
            borderRadius: 8,
            flexDirection: "row",
            width: 300,
          }}
        >
          <AntDesign name={simbolos.get(avaliacao.review)} size={24} color="black" />
          <Text style={[styles.input, {width: 240}]}>{avaliacao.content}</Text>
        </View>
      </Pressable>
      {responding ? (
        <View
          style={{
            backgroundColor: "white",
            padding: 4,
            borderRadius: 8,
            flexDirection: "row",
            margin:4,
            width: 260
          }}
        >
          <TextInput
            placeholder="responder..."
            placeholderTextColor={"grey"}
            onChangeText={(e) => setContent(e)}
            style={{flex: 1}}
          ></TextInput>
          <Pressable onPress={handleCreateResponse} style={{padding: 9}}>
            <Text>Enviar</Text>
          </Pressable>
        </View>
      ) : null}
      {respostas.length > 0 && (
        <ComentariosColapsaveis
          comentarios={respostas}
        ></ComentariosColapsaveis>
      )}
    </>
  );
}

export default function DetalhesFilme() {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [movie, setMovie] = useState<Movie | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (movieId) {
        const foundMovie = getMovieById(movieId as string);
        if (foundMovie) {
          setMovie(foundMovie);
          setAvaliacoes(getAvaliacoesByMovieId(movieId as string));
        } else {
          Alert.alert("Erro", "Filme não encontrado.");
          router.back();
        }
      }
    }, [movieId])
  );

  if (!movie) return;

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={detalhesFilme.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={detalhesFilme.headerTitle} numberOfLines={1}>
          {movie.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={detalhesFilme.scrollViewContent}>
        {movie.isExternal ? (
          <View style={detalhesFilme.externalMoviePlaceholderLarge}>
            <Text style={detalhesFilme.externalMovieTextLarge}>
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
            style={detalhesFilme.moviePoster}
          />
        )}
        <Text style={styles.textoBotao}>Avaliações</Text>
        {avaliacoes.map((a) => (
          <AvaliacaoComponent key={a.id} avaliacao={a} />
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const detalhesFilme = StyleSheet.create({
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
    width: 200,
    height: 300,
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
