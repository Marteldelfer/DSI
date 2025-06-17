// aplicativo/app/_layout.tsx
import { SplashScreen, Stack, router, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig'; // Verifique se este caminho está correto

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Suas fontes aqui, se houver
  });

  const pathname = usePathname();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se o usuário estiver logado, o layout de abas será renderizado automaticamente.
      } else {
        // Redireciona para o fluxo de login se não estiver logado
        if (!pathname.startsWith('/telas/Login') && !pathname.startsWith('/telas/Cadastro')) {
            router.replace('/telas/Login');
        }
      }
    });

    return () => unsubscribe();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // A Stack agora gerencia o grupo de abas e outras telas como modais
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Login" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="telas/CriarPlaylist" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/DetalhesPlaylist" options={{ headerShown: false }} />
      {/* Nova tela para adicionar filme externo */}
      <Stack.Screen name="telas/AdicionarFilmeExterno" options={{ headerShown: false, presentation: 'modal' }} />
      {/* Nova tela para detalhes de filme externo/avaliado */}
      <Stack.Screen name="telas/DetalhesFilmeExterno" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="telas/CriarAvaliacao" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}