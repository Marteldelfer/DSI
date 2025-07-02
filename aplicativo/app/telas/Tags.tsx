import {
  Movie,
  getMovieById,
  Tags,
  getTagsbyMovieandUsuario,
  updateTags,
  addTags,
  getAllTags,
} from "@/utils/mockData";
import {
  Alert,
  View,
  Pressable,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "@/app/styles";
import React, { useState, useCallback, useEffect } from "react";
import { getAuth } from "firebase/auth";

export default function TelaTags() {
  const { movieId } = useLocalSearchParams();
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();

  const [tags, setTags] = useState<Tags | undefined>(undefined);
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(0);
  const [assistido, setAssistido] = useState<"assistido" | "assistido_old" | "drop" | "nao_assistido" | undefined>(undefined)
  const [interesse, setInteresse] = useState<"sim" | "nao" | undefined>(undefined)
  const [reassistir, setReassistir] = useState<"sim" | "nao" | undefined>(undefined)
  const [update, setUpdate] = useState(false)

  useEffect(() => {

      if (update && edit === 0) {atualizarTags(); setUpdate(false)}
      console.log(getAllTags())
      if (!user) {
            Alert.alert("Erro", "Falha ao reconhecer o login.");
            router.back();
        } else {
      const fetchMovieData = async () => {
        if (movieId) {
          const foundMovie = await getMovieById(movieId as string);
          if (foundMovie) {
            setMovie(foundMovie);
              let tags_anteriores = getTagsbyMovieandUsuario(foundMovie, user)
              setTags(tags_anteriores);
            //   if (tags_anteriores) {
            //     if (tags_anteriores.assistido) {setAssistido(tags_anteriores.assistido)}
            //     if (tags_anteriores.interesse) {setInteresse(tags_anteriores.interesse)}
            //     if (tags_anteriores.reassistir) {setReassistir(tags_anteriores.reassistir)}
            //  };
          } else {
            Alert.alert("Erro", "Filme não encontrado.");
            router.back();
          }
        }
        setLoading(false);
      }
      fetchMovieData();
    }}
  );
  
  function atualizarTags(){
    console.log('atualizar')
    if (user?.email && movie) {
    let novas_tags: Tags = {
    id : String(movieId) + String(user.email),
    email_usuario : user.email,
    id_filme : String(movieId),
    assistido : assistido,
    interesse : interesse,
    reassistir : reassistir}

    if (tags) {updateTags(novas_tags)}
    else {addTags(novas_tags)}
    setTags(getTagsbyMovieandUsuario(movie, user));
    console.log(String(getAllTags()[0]['interesse']))
    } return }

  if (loading || !movie) {
    if (!user) {
            Alert.alert("Erro", "Falha ao reconhecer o login.");
            router.back();
        }
    return (
        <View style={styles.container}>
      <View style={styleTags.header}>
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
  if (edit === 0) {
    console.log(assistido)
    console.log(interesse)
    console.log(reassistir)

  return (
    <View style={styles.container}>
      <View style={styleTags.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 20 }}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
        <Text style={styleTags.headerTitle} numberOfLines={1}>
          {movie.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styleTags.scrollViewContent}>
        <Pressable style={styleTags.edittag} onPress={() => {if (movieId && user?.email) {setEdit(1)}}}>
            <Text style={styleTags.tagTitle}>{tags ? "Editar" : "Adicionar"} Tags</Text>
        </Pressable>
        
        {tags?.assistido ? <View style={styleTags.tag}>
            <Text style={styleTags.tagTitle}>{{"assistido" : "Assisti", "assistido_old" : "Assisti faz tempo", "drop" : "Saí no meio do filme","nao_assistido" : "Não assisti"}[tags.assistido]}</Text>
        </View> : null}

        {tags?.interesse ? <View style={styleTags.tag}>
            <Text style={styleTags.tagTitle}>{(tags.interesse === "sim") ? "Tenho interesse" : "Não tenho interesse" }</Text>
        </View> : null}

        {tags?.reassistir ? <View style={styleTags.tag}>
            <Text style={styleTags.tagTitle}>{(tags.reassistir === "sim") ? "Voltaria" : "Não voltaria" }</Text>
        </View> : null}

       
      </ScrollView>
    </View>
  );
}
if (edit === 1) {
    
    return (
    <View style={styles.container}>
        <View style={styleTags.header}>
            <Text style={styleTags.headerTitle}>Você assistiu o filme?</Text>
        </View>
      <ScrollView contentContainerStyle={styleTags.NewTagViewContent}>
        <Pressable style={styleTags.tag} onPress={() => {setAssistido("assistido"); setEdit(2)}}>
            <Text style={styleTags.tagTitle}>Assisti</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setAssistido("assistido_old"); setEdit(2)}}>
            <Text style={styleTags.tagTitle}>Assisti faz tempo</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setAssistido("drop"); setEdit(2)}}>
            <Text style={styleTags.tagTitle}>Saí no meio do filme</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setAssistido("nao_assistido"); setEdit(2)}}>
            <Text style={styleTags.tagTitle}>Não assisti</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setEdit(2)}}>
            <Text style={styleTags.tagTitle}>Pular</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
if (edit === 2) {
  return (
    <View style={styles.container}>
        <View style={styleTags.header}>
            <Text style={styleTags.headerTitle}>Você tem interesse em filmes como esse?</Text>
        </View>
      <ScrollView contentContainerStyle={styleTags.NewTagViewContent}>
        <Pressable style={styleTags.tag} onPress={() => {setInteresse("sim"); setEdit(3)}}>
            <Text style={styleTags.tagTitle}>Tenho interesse</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setInteresse("nao"); setEdit(3)}}>
            <Text style={styleTags.tagTitle}>Não tenho interesse</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setEdit(3)}}>
            <Text style={styleTags.tagTitle}>Pular</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
if (edit === 3) {
  return (
    <View style={styles.container}>
        <View style={styleTags.header}>
            <Text style={styleTags.headerTitle}>Você Voltaria a assistir, reassistiria ou daria uma chance a esse filme?</Text>
        </View>
      <ScrollView contentContainerStyle={styleTags.NewTagViewContent}>
        <Pressable style={styleTags.tag} onPress={async () => {await setReassistir("sim"); setUpdate(true); setEdit(0)}}>
            <Text style={styleTags.tagTitle}>Voltaria</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setReassistir("nao"); setUpdate(true); setEdit(0)}}>
            <Text style={styleTags.tagTitle}>Não Voltaria</Text>
        </Pressable>
        <Pressable style={styleTags.tag} onPress={() => {setUpdate(true); setEdit(0)}}>
            <Text style={styleTags.tagTitle}>Pular</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
}



const styleTags = StyleSheet.create({
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
    width: "100%",
  },
  NewTagViewContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  tag: {
    backgroundColor: "#1a2b3e",
    margin: 20,
    alignItems:"center",
    justifyContent:"center",
    borderRadius: 10,
    height: 70,
    width: "100%",
  },
  edittag: {
    backgroundColor: "#3e9c9c",
    margin: 20,
    alignItems:"center",
    justifyContent:"center",
    borderRadius: 10,
    height: 70,
    width: "100%",
  },
  tagTitle: {
    color: "#eaeaea",
    fontSize: 20,
    fontWeight: "bold",
  },
});