// aplicativo/app/_layout.tsx
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth'; // Importa onAuthStateChanged do Firebase Auth
import { auth } from '../src/config/firebaseConfig'; // Importa a instância de autenticação do Firebase

// Impede que a splash screen se esconda automaticamente antes que os recursos sejam carregados.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Adicione suas fontes aqui, se houver
    // Por exemplo: Nunito_400Regular: require('../assets/fonts/Nunito_400Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // Esconde a splash screen assim que as fontes forem carregadas (e o restante do app estiver pronto)
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Adiciona um listener para o estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário logado: redireciona para a tela Home
        console.log('Usuário logado:', user.email);
        router.replace('/telas/Home');
      } else {
        // Usuário não logado: redireciona para a tela de Login
        console.log('Nenhum usuário logado. Redirecionando para login.');
        router.replace('/telas/Login');
      }
    });

    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  if (!loaded) {
    return null; // Retorna null enquanto as fontes não são carregadas
  }

  // Define as rotas do seu aplicativo
  return (
    <Stack>
      {/* Esconde o cabeçalho para as telas de Login e Cadastro */}
      <Stack.Screen name="telas/Login" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Cadastro" options={{ headerShown: false }} />
      {/* Para todas as outras telas (como Home, Perfil, etc.), você pode optar por ter um cabeçalho ou não */}
      <Stack.Screen name="telas/Home" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Perfil" options={{ headerShown: false }} />
      {/* Se tiver outras rotas, adicione-as aqui */}
      {/* Por exemplo: <Stack.Screen name="[...missing]" options={{ headerShown: false }} /> para rota não encontrada */}
    </Stack>
  );
}