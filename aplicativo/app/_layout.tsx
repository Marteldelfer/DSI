// aplicativo/app/_layout.tsx
import { SplashScreen, Stack, router, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Adicione suas fontes aqui se necessário
  });

  const pathname = usePathname();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAuthScreen =
        pathname.startsWith('/telas/Login') ||
        pathname.startsWith('/telas/Cadastro') ||
        pathname === '/';

      if (!user && !isAuthScreen) {
        router.replace('/telas/Login');
      }
    });

    return () => unsubscribe();
  }, [loaded, pathname]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Login" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Busca" options={{ headerShown: false }} />
      <Stack.Screen name="telas/CriarPlaylist" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesPlaylist" options={{ headerShown: false }} />
      <Stack.Screen name="telas/ListaPlaylists" options={{ headerShown: false }} />
      <Stack.Screen name="telas/AdicionarFilmeExterno" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/EditarFilmeExterno" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/CriarAvaliacao" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/Tags" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesFilmeTMDB" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesFilmeExterno" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/CriarEvento" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesEvento" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/ListaEventos" options={{ headerShown: false }} />
      <Stack.Screen name="telas/CriarGrupo" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesGrupo" options={{ headerShown: false }} />
      <Stack.Screen name="telas/ListaGrupos" options={{ headerShown: false }} />
    </Stack>
  );
}
