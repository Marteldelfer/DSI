// SUBSTITUA O CONTEÚDO DE: aplicativo/app/telas/DetalhesFilme.tsx
import {
  Movie,
  Avaliacao,
  getMovieById,
  getComentariosByAvaliacaoId,
  createComentario,
  getAvaliacoesByMovieId,
  Comentario,
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
import { ComentariosColapsaveis } from "../componentes/ComentariosColapsaveis";

function AvaliacaoComponent({
  avaliacao,
}: {
  avaliacao: Avaliacao;
}): React.JSX.Element {
  const [respostas, setRespostas] = useState<Comentario[]>([]);
  const [responding, setResponding] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  const simbolos = new Map<string, any>(); // Usar 'any' para o nome do ícone
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
          <AntDesign name={simbolos.get(avaliacao.review)} size={24} color="black" style={{marginRight: 10}} />
          <Text style={[styles.input, {width: 240}]}>{avaliacao.content}</Text>
        </View>
      </Pressable>
      {responding && (
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
      )}
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
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchMovieData = async () => {
        setLoading(true);
        if (movieId) {
          const foundMovie = await getMovieById(movieId as string);
          if (foundMovie) {
            setMovie(foundMovie);
            setAvaliacoes(getAvaliacoesByMovieId(movieId as string));
          } else {
            Alert.alert("Erro", "Filme não encontrado.");
            router.back();
          }
        }
        setLoading(false);
      }
      fetchMovieData();
    }, [movieId])
  );
  
  if (loading || !movie) {
    return (
        <View style={[styles.container, {justifyContent: 'center'}]}>
            <ActivityIndicator size="large" color="#3E9C9C" />
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
        <Image
          source={
            movie.posterUrl
              ? { uri: movie.posterUrl }
              : require("../../assets/images/filmeia-logo2.png")
          }
          style={detalhesFilme.moviePoster}
        />

        <View style={detalhesFilme.detailsContainer}>
          <Text style={detalhesFilme.movieTitle}>{movie.title} ({movie.releaseYear})</Text>
          {movie.overview ? (
            <Text style={detalhesFilme.overview}>{movie.overview}</Text>
          ) : (
            <Text style={detalhesFilme.overview}>Sinopse não disponível.</Text>
          )}
        </View>
        
        <Text style={detalhesFilme.sectionTitle}>Avaliações da Comunidade</Text>
        {avaliacoes.length > 0 ? (
          avaliacoes.map((a) => (
            <AvaliacaoComponent key={a.id} avaliacao={a} />
          ))
        ) : (
          <Text style={{color: '#ccc', marginTop: 10}}>Este filme ainda não possui avaliações.</Text>
        )}
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