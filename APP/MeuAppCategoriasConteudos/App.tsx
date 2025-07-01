// App.tsx
import React, { useEffect } from 'react';
import { LogBox } from 'react-native'; // Importado LogBox
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// --- SUPRESSÃO DE AVISOS DO REANIMATED ---
// Isso impede que o aviso "It looks like you might be using shared value's .value..." apareça no console.
// É seguro fazer isso se você não está usando React Native Reanimated intencionalmente para estas animações.
if (__DEV__) { // __DEV__ é uma variável global que é true em desenvolvimento e false em produção
  LogBox.ignoreLogs([
    /It looks like you might be using shared value's .value inside reanimated inline style./,
  ]);
}
// --- FIM DA SUPRESSÃO DE AVISOS ---

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.otf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
