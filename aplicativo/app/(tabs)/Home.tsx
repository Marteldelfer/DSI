// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/Home.tsx
import React, { useState } from 'react';
import { ScrollView, Text, View, TextInput, Image, StyleSheet, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { mockMovies } from '../../utils/mockData';

function ComponenteFilmeInterativo({imageLink, title}: {imageLink: string | null, title: string}) {
  const [clicado, setClicado] = useState(false);
  const estiloPequeno = {width:100, height: 150};
  const estiloGrande = {width:130, height: 195, position: 'absolute', zIndex: 10, top: -22.5, left: -15};

  return (
    <View style={homeStyles.movieWrapper}>
      <Pressable onPress={() => setClicado(!clicado)} style={homeStyles.pressableArea}>
        <Image
          // CAMINHO CORRIGIDO AQUI
          source={imageLink ? {uri: imageLink} : require("../../assets/images/filmeia-logo2.png")}
          style={[homeStyles.moviePoster, clicado ? estiloGrande : estiloPequeno]}
        />
      </Pressable>
      
      <Text style={homeStyles.movieTitle}>{title}</Text>

      {clicado && (
        <View style={homeStyles.interactionIconsContainer}>
            <View style={homeStyles.iconWrapper}><AntDesign name="like2" size={20} color="black" /></View>
            <View style={homeStyles.iconWrapper}><AntDesign name="dislike2" size={20} color="black" /></View>
            <View style={homeStyles.iconWrapper}><AntDesign name="staro" size={20} color="black" /></View>
        </View>
      )}
    </View>
  );
}

function Home() {
  const [pesquisa, setPesquisa] = useState("");
  return (
    <View style={styles.container}>
      <View style={{width: '100%', paddingHorizontal: 20, marginTop: 36, flex: 1, paddingBottom: 70}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* CAMINHO CORRIGIDO AQUI */}
          <Image source={require("../../assets/images/filmeia-logo2.png")} style={homeStyles.logo} />
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={36} color="black" />
            <TextInput placeholder="Pesquisar Filmes" style={styles.input} placeholderTextColor={"black"} onChangeText={setPesquisa} value={pesquisa} />
          </View>
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Recomendações</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {mockMovies.map((movie) => <ComponenteFilmeInterativo key={movie.id} imageLink={movie.posterUrl} title={movie.title} />)}
            </ScrollView>
          </View>
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Seu Perfil Cinematográfico</Text>
            {/* CAMINHO CORRIGIDO AQUI */}
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
    movieWrapper: { width: 120, height: 250, alignItems: 'center', marginHorizontal: 5 },
    pressableArea: { width: 100, height: 150, alignItems: 'center', justifyContent: 'center' },
    moviePoster: { borderRadius: 12 },
    movieTitle: { color: "#eaeaea", fontSize: 12, textAlign: 'center', marginTop: 8, width: 100 },
    interactionIconsContainer: { flexDirection: "row", justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 8, gap: 10 },
    iconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#3E9C9C", justifyContent: 'center', alignItems: 'center' }
});

export default Home;