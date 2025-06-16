// SUBSTITUA O CONTEÚDO DE: aplicativo/app/(tabs)/Home.tsx
import React, { useState } from 'react';
import { ScrollView, Text, View, TextInput, Image, StyleSheet, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../styles';
import { mockMovies } from '../../utils/mockData';

// Usando a sua lógica original de troca de tamanho, com correções de layout
function ComponenteFilme({imageLink, title}: {imageLink: string | null, title: string}) {
  const [clicado, setClicado] = useState(false);

  // Estilos para o pôster pequeno e grande
  const estiloPequeno = { width: 100, height: 150, borderRadius: 12 };
  const estiloGrande = { width: 130, height: 195, borderRadius: 16 };

  return (
    // 1. Contêiner com altura e largura fixas para não quebrar o layout
    <View style={homeStyles.movieWrapper}>
      <Pressable onPress={() => setClicado(!clicado)}>
        <Image
          source={imageLink ? {uri: imageLink} : require("../../assets/images/filmeia-logo2.png")}
          // 2. Lógica de troca de estilo que você tinha antes
          style={clicado ? estiloGrande : estiloPequeno}
        />
      </Pressable>
      
      <Text style={homeStyles.movieTitle} numberOfLines={2}>{title}</Text>

      {clicado && (
        // 3. Ícones com estilo corrigido para ficarem juntos
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
          <Image source={require("../../assets/images/filmeia-logo2.png")} style={homeStyles.logo} />
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={36} color="black" />
            <TextInput placeholder="Pesquisar Filmes" style={styles.input} placeholderTextColor={"black"} onChangeText={setPesquisa} value={pesquisa} />
          </View>
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Recomendações</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {mockMovies.map((movie) => <ComponenteFilme key={movie.id} imageLink={movie.posterUrl} title={movie.title} />)}
            </ScrollView>
          </View>
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
      width: 130,      // Largura fixa para conter o pôster
      height: 280,     // Altura fixa para alinhar todos os filmes
      alignItems: 'center',
      marginRight: 5,
    },
    movieTitle: { color: "#eaeaea", fontSize: 12, textAlign: 'center', marginTop: 8, width: 100, height: 30 },
    interactionIconsContainer: {
      flexDirection: "row",
      justifyContent: 'center', // Centraliza os ícones como um grupo
      alignItems: 'center',
      width: '100%',
      marginTop: 8,
      gap: 12, // Controla o espaço ENTRE os ícones
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#3E9C9C",
      justifyContent: 'center',
      alignItems: 'center'
    }
});

export default Home;