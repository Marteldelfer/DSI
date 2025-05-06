import { useRouter, Link } from 'expo-router';
import React, { use, useState } from 'react';
import type {PropsWithChildren} from 'react';
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
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { AntDesign } from '@expo/vector-icons';

import TabBar from '../componentes/TabBar';

const styles = StyleSheet.create({
  textInput: {
    padding: 8,
    backgroundColor: '#eaeaea',
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 26,
    width: 300,
    color: "black",
    fontFamily: "Nunito_400Regular",
  },
});

function fetchLinkFilmes(): string[] {
  const linkFilmes = [
      "https://image.tmdb.org/t/p/w500/ojDg0PGvs6R9xYFodRct2kdI6wC.jpg",
      "https://image.tmdb.org/t/p/w500/nj01hspawPof0mJmlgfjuLyJuRN.jpg",
      "https://image.tmdb.org/t/p/w500/75aHn1NOYXh4M7L5shoeQ6NGykP.jpg",
      "https://image.tmdb.org/t/p/w500/3rvvpS9YPM5HB2f4HYiNiJVtdam.jpg",
      "https://image.tmdb.org/t/p/w500/7ln81BRnPR2wqxuITZxEciCe1lc.jpg",
  ];
  return linkFilmes;
}

function ComponenteFilme({imageLink}: {imageLink: string}): React.JSX.Element {

  return (
    <View style={{padding: 4}}>
      <Image 
        source={{uri: imageLink}}
        style={{width:100, height: 150, borderRadius: 12}}
      />
      <View style={{flexDirection: "row"}}>
        <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: "#eaeaea", margin: "auto", marginTop:4}}>
          <AntDesign name="check" size={18} color="black" style={{margin: "auto"}}/>
        </View>
        <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: "#eaeaea", margin: "auto", marginTop:4}}>
          <AntDesign name="close" size={18} color="black" style={{margin: "auto"}}/>
        </View>
        <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: "#eaeaea", margin: "auto", marginTop:4}}>
          <AntDesign name="star" size={18} color="black" style={{margin: "auto"}}/></View>  
      </View>
    </View>
  );
}

function Home(): React.JSX.Element {

  const [pesquisa, setPesquisa] = useState("");
  const linkFilmes = fetchLinkFilmes();

  return (
    <View style={{backgroundColor: "#005F6B", height:"100%", flexDirection: "column"}}>
      <View style={{width: 300, marginLeft: "auto", marginRight: "auto", marginTop: 36, flex: 1}}>

        <ScrollView>
          <Image
            source={require("../../assets/images/filmeia-logo.png")}
            style={{width: 200, height: 150, resizeMode: "contain", marginLeft: "auto", marginRight: "auto"}}>
          </Image>
          <View style={[styles.textInput, {marginBottom: 10}]}>
            <AntDesign name="search1" size={36} color="black" />
            <TextInput placeholder="Pesquisar Filmes" style={{paddingLeft: 12, color: "black"}} placeholderTextColor={"black"}
              onChangeText={next => {
                setPesquisa(next);
            }}></TextInput>
          </View>
          <View style={{marginBottom: 12, marginTop: 24}}>
            <Text style={{color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8}}>Recomendações</Text>
            <ScrollView horizontal={true}>
              <ComponenteFilme imageLink={linkFilmes[0]}></ComponenteFilme>
              <ComponenteFilme imageLink={linkFilmes[1]}></ComponenteFilme>
              <ComponenteFilme imageLink={linkFilmes[2]}></ComponenteFilme>
              <ComponenteFilme imageLink={linkFilmes[3]}></ComponenteFilme>
              <ComponenteFilme imageLink={linkFilmes[4]}></ComponenteFilme>
            </ScrollView>
          </View>
          <Text style={{color: "#eaeaea", fontWeight: "bold", fontSize: 18}}>Seu Perfil Cinematográfico</Text>
        </ScrollView>

        <TabBar></TabBar>
      </View>
    </View>
  );
}

export default Home;