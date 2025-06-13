// aplicativo/app/telas/Home.tsx
import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
  Alert,
  Image,
  Pressable
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import { styles } from '../../src/styles'; // Importe os estilos globais

import TabBar from '../../src/componentes/TabBar'; // Caminho de importação ajustado


function Home(): React.JSX.Element {

  const [pesquisa, setPesquisa] = useState("");
  const linkFilmes = [
      "https://image.tmdb.org/t/p/w500/ojDg0PGvs6R9xYFodRct2kdI6wC.jpg",
      "https://image.tmdb.org/t/p/w500/nj01hspawPof0mJmlgfjuLyJuRN.jpg",
      "https://image.tmdb.org/t/p/w500/75aHn1NOYXh4M7L5shoeQ6NGykP.jpg",
      "https://image.tmdb.org/t/p/w500/3rvvpS9YPM5HB2f4HYiNiJVtdam.jpg",
      "https://image.tmdb.org/t/p/w500/7ln81BRnPR2wqxuITZxEciCe1lc.jpg",
  ];

  function ComponenteFilme({imageLink}: {imageLink: string}): React.JSX.Element {
    const [clicado, setClicado] = useState(false);
    const estiloPequeno = {width:100, height: 150, borderRadius: 12};
    const estiloGrande = {width:130, height: 195, borderRadius: 16}

    return (
      <View style={{padding: 4}}>
        <Pressable onPress={() => setClicado(!clicado)}>
          <Image
            source={{uri: imageLink}}
            style={clicado ? estiloGrande : estiloPequeno}
          />
        </Pressable>
        {(clicado) ? <View style={{flexDirection: "row"}}>
          <View style={{width: 34, height: 34, borderRadius: 17, backgroundColor: "#3E9C9C", margin: "auto", marginTop:4}}>
            <AntDesign name="like2" size={26} color="black" style={{margin: "auto"}}/>
          </View>
          <View style={{width: 34, height: 34, borderRadius: 17, backgroundColor: "#3E9C9C", margin: "auto", marginTop:4}}>
            <AntDesign name="dislike2" size={26} color="#black" style={{margin: "auto"}}/>
          </View>
          <View style={{width: 34, height: 34, borderRadius: 17, backgroundColor: "#3E9C9C", margin: "auto", marginTop:4}}>
            <AntDesign name="staro" size={26} color="#black" style={{margin: "auto"}}/></View>
        </View> : null}
      </View>
    );
  }

  return (
    <View style={{backgroundColor: "#2E3D50", height:"100%", flexDirection: "column"}}>
      <View style={{width: 300, marginLeft: "auto", marginRight: "auto", marginTop: 36, flex: 1}}>

        <ScrollView>
          <Image
            source={require("../../assets/images/filmeia-logo2.png")}
            style={{width: 300, height: 150, resizeMode: "contain", marginLeft: "auto", marginRight: "auto"}}>
          </Image>
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={36} color="black" />
            <TextInput placeholder="Pesquisar Filmes" style={styles.input} placeholderTextColor={"black"}
              onChangeText={setPesquisa}
              value={pesquisa}
            ></TextInput>
          </View>
          <View style={{marginBottom: 12, marginTop: 24}}>
            <Text style={{color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8}}>Recomendações</Text>
            <ScrollView horizontal={true}>
              {linkFilmes.map((link, index) => (
                <ComponenteFilme key={index} imageLink={link} />
              ))}
            </ScrollView>
          </View>
          <Text style={{color: "#eaeaea", fontWeight: "bold", fontSize: 18}}>Seu Perfil Cinematográfico</Text>
          <Image
            source={require("../../assets/images/stats.png")}
            style={{width: 300, height: 80, resizeMode: "stretch", marginLeft: "auto", marginRight: "auto"}}>
          </Image>
        </ScrollView>
      </View>
      <TabBar></TabBar>
    </View>
  );
}

export default Home;