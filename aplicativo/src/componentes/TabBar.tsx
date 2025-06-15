// aplicativo/src/componentes/TabBar.tsx
import { Link } from 'expo-router';
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable
} from 'react-native';

import { AntDesign, Entypo } from '@expo/vector-icons';

function TabBar(): React.JSX.Element {

  return (
    <View style={tabBarStyles.container}>
			<Link href={"/telas/Home"} asChild>
				<Pressable style={tabBarStyles.item}>
                    {/* SOLUÇÃO: Ícone e Texto DENTRO DE UMA ÚNICA View */}
                    <View style={tabBarStyles.itemContent}>
                        <AntDesign name="home" size={28} color="#eaeaea" />
                        <Text style={tabBarStyles.text}>Home</Text>
                    </View>
				</Pressable>
			</Link>

			<Link href={"/telas/MeusFilmes"} asChild>
				<Pressable style={tabBarStyles.item}>
                    {/* SOLUÇÃO: Ícone e Texto DENTRO DE UMA ÚNICA View */}
                    <View style={tabBarStyles.itemContent}>
                        <AntDesign name="videocamera" size={28} color="#eaeaea" />
                        <Text style={tabBarStyles.text}>Playlists</Text>
                    </View>
				</Pressable>
			</Link>

			<Link href={"/telas/Home"} asChild>
				<Pressable style={tabBarStyles.item}>
                    {/* SOLUÇÃO: Ícone e Texto DENTRO DE UMA ÚNICA View */}
                    <View style={tabBarStyles.itemContent}>
                        <Entypo name="map" size={28} color="#eaeaea" />
                        <Text style={tabBarStyles.text}>Cinemas</Text>
                    </View>
				</Pressable>
			</Link>

			<Link href={"/telas/Perfil"} asChild>
				<Pressable style={tabBarStyles.item}>
                    {/* SOLUÇÃO: Ícone e Texto DENTRO DE UMA ÚNICA View */}
                    <View style={tabBarStyles.itemContent}>
                        <AntDesign name="user" size={28} color="#eaeaea" />
                        <Text style={tabBarStyles.text}>Perfil</Text>
                    </View>
				</Pressable>
			</Link>
    </View>
  );
}

export default TabBar;

const tabBarStyles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-evenly",
        padding: 10,
        paddingBottom: 40,
        backgroundColor: "#1A2B3E",
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
    },
    itemContent: { // NOVO ESTILO: Para agrupar ícone e texto dentro do Pressable
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        color: '#eaeaea',
        marginTop: 4,
    }
});