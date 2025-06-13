// aplicativo/src/config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth'; // Removido getAuth, já que initializeAuth é mais completo.

// CORREÇÃO: Usar o caminho de importação específico para React Native
//@ts-ignore
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

import Constants from 'expo-constants';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };