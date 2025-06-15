// aplicativo/app/_layout.tsx
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Adicione suas fontes aqui, se houver
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
        console.log('Usuário logado:', user.email);
        if (pathname === '/telas/Login' || pathname === '/telas/Cadastro' || pathname === '/') {
            router.replace('/telas/Home');
        }
      } else {
        console.log('Nenhum usuário logado. Redirecionando para login.');
        if (pathname !== '/telas/Login' && pathname !== '/telas/Cadastro') {
            router.replace('/telas/Login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="telas/Login" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Home" options={{ headerShown: false }} />
      <Stack.Screen name="telas/Perfil" options={{ headerShown: false }} />
      <Stack.Screen name="telas/MeusFilmes" options={{ headerShown: false }} />
      <Stack.Screen name="telas/CriarPlaylist" options={{ headerShown: false }} />
      <Stack.Screen name="telas/DetalhesPlaylist" options={{ headerShown: false }} />
    </Stack>
  );
}