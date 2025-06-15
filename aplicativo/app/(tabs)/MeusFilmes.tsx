// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/MeusFilmes.tsx
import React from 'react';
import { ScrollView, View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { mockMovies } from '../../utils/mockData';

function ComponenteFilmeAvaliado({imageLink, title, statusIcon}: {imageLink: string | null, title: string, statusIcon: "like2" | "dislike2" | "staro"}) {
  return (
    <View style={meusFilmesStyles.movieContainer}>
        {/* CAMINHO CORRIGIDO AQUI */}
        <Image source={imageLink ? {uri: imageLink} : require("../../assets/images/filmeia-logo2.png")} style={meusFilmesStyles.moviePoster} />
        <Text style={meusFilmesStyles.movieTitle}>{title}</Text>
        <View style={meusFilmesStyles.statusIconWrapper}><AntDesign name={statusIcon} size={18} color="#eaeaea" /></View>
    </View>
  );
}

function MeusFilmes() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={{width: '100%', paddingHorizontal: 20, marginTop: 36, flex: 1, paddingBottom: 70}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* CAMINHO CORRIGIDO AQUI */}
          <Image source={require("../../assets/images/filmeia-logo2.png")} style={meusFilmesStyles.logo} />
          <Pressable style={{width: '100%', marginBottom: 12}} onPress={() => router.push('/telas/ListaPlaylists')}>
            <View style={{backgroundColor: "#3E9C9C", padding: 12, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <AntDesign name="videocamera" size={24} color="black" style={{marginRight: 10}}/>
              <Text style={styles.textoBotao}>MINHAS PLAYLISTS</Text>
            </View>
          </Pressable>
          <View style={meusFilmesStyles.sectionContainer}>
            <Text style={meusFilmesStyles.sectionTitle}>Filmes que você avaliou</Text>
            <View style={meusFilmesStyles.moviesGrid}>
              <ComponenteFilmeAvaliado imageLink={mockMovies[0].posterUrl} title={mockMovies[0].title} statusIcon="like2" />
              <ComponenteFilmeAvaliado imageLink={mockMovies[1].posterUrl} title={mockMovies[1].title} statusIcon="dislike2" />
              <ComponenteFilmeAvaliado imageLink={mockMovies[2].posterUrl} title={mockMovies[2].title} statusIcon="staro" />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const meusFilmesStyles = StyleSheet.create({
    logo: { width: 300, height: 150, resizeMode: "contain", alignSelf: 'center' },
    sectionContainer: { marginTop: 24 },
    sectionTitle: { color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8 },
    moviesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    movieContainer: { padding: 4, alignItems: 'center', width: '32%', marginBottom: 15 },
    moviePoster: { width: '100%', height: 140, borderRadius: 12 },
    movieTitle: { color: "#eaeaea", fontSize: 11, textAlign: 'center', marginTop: 4, height: 30 },
    statusIconWrapper: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 15 }
});

export default MeusFilmes;