// aplicativo/app/telas/Home.tsx
import { useRouter, Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Pressable
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import { styles } from '../../src/styles';

import TabBar from '../../src/componentes/TabBar';
import { mockMovies as linkFilmesMock } from './MeusFilmes'; 


// Componente Filme
function ComponenteFilme({imageLink, title}: {imageLink: string | null, title: string}): React.JSX.Element {
  const [clicado, setClicado] = useState(false);
  const estiloPequeno = {width:100, height: 150, borderRadius: 12};
  const estiloGrande = {width:130, height: 195, borderRadius: 16}

  return (
    <View style={{padding: 4}}>
      <Pressable onPress={() => setClicado(!clicado)}>
        <Image
          source={imageLink ? {uri: imageLink} : require("../../assets/images/filmeia-logo2.png")}
          style={clicado ? estiloGrande : estiloPequeno}
        />
         <Text style={{ color: "#eaeaea", fontSize: 12, textAlign: 'center', marginTop: 4 }}>
           {title}
         </Text>
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

function Home(): React.JSX.Element {
  const [pesquisa, setPesquisa] = useState("");

  return (
    <View style={{backgroundColor: "#2E3D50", height:"100%", flexDirection: "column"}}>
      <View style={{width: 300, marginLeft: "auto", marginRight: "auto", marginTop: 36, flex: 1}}>

        <ScrollView scrollEventThrottle={400}>
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
          
          <Link href={"/telas/MeusFilmes"} asChild> 
            <Pressable style={{width: '100%', marginBottom: 12}}>
              <View style={{backgroundColor: "#3E9C9C", padding: 12, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <AntDesign name="videocamera" size={24} color="black" style={{marginRight: 10}}/>
                <Text style={styles.textoBotao}>PLAYLISTS</Text>
              </View>
            </Pressable>
          </Link>


          <View style={{marginBottom: 12, marginTop: 24}}>
            <Text style={{color: "#eaeaea", fontWeight: "bold", fontSize: 18, marginBottom: 8}}>Recomendações</Text>
            <ScrollView horizontal={true}>
              {linkFilmesMock.map((movie) => (
                <ComponenteFilme
                  key={movie.id}
                  imageLink={movie.posterUrl}
                  title={movie.title}
                />
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