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

import { AntDesign, Entypo } from '@expo/vector-icons';

function TabBar(): React.JSX.Element {

  return (
    <View style={{
			position: "fixed", bottom: 0, flexDirection: "row", justifyContent: "center", padding: 10, paddingBottom: 40, backgroundColor: "#1A2B3E"
		}}>
			<Link href={"/telas/Home"}>
				<View style={{flex: 1, width: 75, justifyContent: "center"}}>
					<AntDesign name="home" size={28} color="#eaeaea" style={{margin: "auto"}}/>
				</View>
			</Link>

			<Link href={"/telas/Home"}>
				<View style={{flex: 1, width: 75}}>
					<AntDesign name="videocamera" size={28} color="#eaeaea" style={{margin: "auto"}}/>
				</View>
			</Link>

			<Link href={"/telas/Home"}>
				<View style={{flex: 1, width: 75}}>
					<Entypo name="map" size={28} color="#eaeaea" style={{margin: "auto"}}/>
				</View>
			</Link>

			<Link href={"/telas/Login"}>
				<View style={{flex: 1, width: 75}}>
					<AntDesign name="user" size={28} color="#eaeaea" style={{margin: "auto"}}/>
				</View>
			</Link>
    </View>
  );
}

export default TabBar;