import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppInitialization } from '@/hooks/use-app-initialization';
import { usePlaybackNotificationSync } from '@/hooks/usePlaybackNotificationSync';
import { PlayerProvider } from '@/context/PlayerContext';
import { MiniPlayer } from '@/components/enhanced-mini-player';
import { PlayerSyncManager } from '@/components/player-sync-manager';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isInitialized } = useAppInitialization();
  
  // Sincronizar eventos de notificación con el reproductor
  usePlaybackNotificationSync();

  const theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#00D4FF',
      background: '#000',
      card: '#0a0a0a',
      text: '#FFF',
      border: '#1a1a1a',
      notification: '#00D4FF',
    }
  };

  return (
    <PlayerProvider>
      <PlayerSyncManager>
        <ThemeProvider value={theme}>
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <MiniPlayer />
          </View>
          <StatusBar style="light" />
        </ThemeProvider>
      </PlayerSyncManager>
    </PlayerProvider>
  );
}
