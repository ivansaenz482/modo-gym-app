import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { useAppFonts } from './src/theme/fonts';
import { useSeasonStore } from './src/store/seasonStore';
import { InstallPWA } from './src/components/ui/InstallPWA';

export default function App() {
  const fontsLoaded = useAppFonts();
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => { useSeasonStore.getState().load(); }, []);

  // Mantén el splash visible mientras cargan las fuentes
  if (!fontsLoaded || showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} fontsReady={fontsLoaded} />
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
      <InstallPWA />
    </SafeAreaProvider>
  );
}
