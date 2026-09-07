import { useFonts as useInter } from '@expo-google-fonts/inter';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold, BarlowCondensed_900Black } from '@expo-google-fonts/barlow-condensed';

// Fuente para texto / etiquetas
export function useAppFonts() {
  const [fontsLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_900Black,
  });
  return fontsLoaded;
}

// Refs de tipografía para usar en StyleSheet
export const appFont = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};

// Números grandes atléticos (stats, contadores)
export const statFont = {
  bold: 'BarlowCondensed_700Bold',
  extrabold: 'BarlowCondensed_800ExtraBold',
  black: 'BarlowCondensed_900Black',
};

