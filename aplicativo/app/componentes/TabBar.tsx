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

import { AntDesign, Ionicons } from '@expo/vector-icons';

function TabBar(): React.JSX.Element {

  return (
    <View style={{
			position: "fixed", bottom: 0, flexDirection: "row", justifyContent: "center", padding: 10, paddingBottom: 40, backgroundColor: "#004F5B"
		}}>
			<Link href={"/telas/Home"}>
				<View style={{flex: 1, width: 100, justifyContent: "center"}}>
					<AntDesign name="home" size={24} color="#eaeaea" style={{margin: "auto"}}/>
					<Text style={{fontSize: 12, margin: "auto", color: "#eaeaea", fontWeight: "bold"}}>Recomendações</Text>
				</View>
			</Link>

			<Link href={"/telas/Home"}>
				<View style={{flex: 1, width: 100}}>
					<AntDesign name="videocamera" size={24} color="#eaeaea" style={{margin: "auto"}}/>
					<Text style={{fontSize: 12, margin: "auto", color: "#eaeaea", fontWeight: "bold"}}>Meus Filmes</Text>
				</View>
			</Link>

			<Link href={"/telas/Login"}>
				<View style={{flex: 1, width: 100}}>
					<AntDesign name="user" size={24} color="#eaeaea" style={{margin: "auto"}}/>
					<Text style={{fontSize: 12, margin: "auto", color: "#eaeaea", fontWeight: "bold"}}>Perfil</Text>
				</View>
			</Link>
    </View>
  );
}

export default TabBar;