import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { usePlayerStore } from '@/store/playerStore';

const SIDEBAR_WIDTH = 280;

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  iconFamily: 'MaterialCommunityIcons' | 'Feather';
  onPress: () => void;
  badge?: number | string;
  color?: string;
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const { playerState, playerQueue } = usePlayer();
  const { showFavoritesOnly, toggleFavorites } = usePlayerStore();
  const [animationValue] = useState(new Animated.Value(isOpen ? 1 : 0));
  const { width: screenWidth } = useWindowDimensions();

  React.useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const translateX = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleNavigation = (screen: string) => {
    onNavigate?.(screen);
    onClose();
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'library',
      label: 'Biblioteca',
      icon: 'library-music',
      iconFamily: 'MaterialCommunityIcons',
      onPress: () => handleNavigation('library'),
      badge: playerQueue.length,
      color: '#00D4FF',
    },
    {
      id: 'playlists',
      label: 'Mis Playlists',
      icon: 'square.stack.fill',
      iconFamily: 'Feather',
      onPress: () => handleNavigation('playlists'),
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: 'heart',
      iconFamily: 'Feather',
      onPress: toggleFavorites,
      color: showFavoritesOnly ? '#FF6B6B' : '#AAA',
    },
    {
      id: 'queue',
      label: 'Cola de reproducción',
      icon: 'list',
      iconFamily: 'Feather',
      onPress: () => handleNavigation('queue'),
      badge: playerQueue.length,
    },
    {
      id: 'now-playing',
      label: 'Reproduciendo',
      icon: 'music',
      iconFamily: 'Feather',
      onPress: () => handleNavigation('now-playing'),
      color: playerState.isPlaying ? '#00D4FF' : '#AAA',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <Pressable
          style={[
            styles.overlay,
            {
              opacity,
            },
          ]}
          onPress={onClose}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons name="music-circle" size={40} color="#00D4FF" />
              <ThemedText style={styles.appName}>MP3 Player</ThemedText>
              <ThemedText style={styles.version}>v0.7</ThemedText>
            </View>
          </View>

          {/* Current Track Info */}
          {playerState.currentTrack && (
            <View style={styles.nowPlayingSection}>
              <ThemedText style={styles.nowPlayingLabel}>Reproduciendo</ThemedText>
              <ThemedText style={styles.trackTitle} numberOfLines={1}>
                {playerState.currentTrack.title}
              </ThemedText>
              <ThemedText style={styles.trackArtist} numberOfLines={1}>
                {playerState.currentTrack.artist || 'Artista desconocido'}
              </ThemedText>
              <View style={styles.playingIndicator}>
                <Feather name={playerState.isPlaying ? 'pause' : 'play'} size={16} color="#00D4FF" />
                <ThemedText style={styles.playingTime}>
                  {Math.round(playerState.position / 1000)}s
                </ThemedText>
              </View>
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {sidebarItems.map((item) => (
              <SidebarMenuItemComponent key={item.id} item={item} />
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <StatItem label="Pistas" value={playerQueue.length.toString()} icon="music" />
            <StatItem
              label="Estado"
              value={playerState.isPlaying ? 'Reproduciendo' : 'Pausado'}
              icon={playerState.isPlaying ? 'play' : 'pause'}
            />
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <SidebarMenuItem
              icon="settings"
              label="Configuración"
              onPress={() => handleNavigation('settings')}
              iconFamily="Feather"
            />
            <SidebarMenuItem
              icon="info"
              label="Acerca de"
              onPress={() => handleNavigation('about')}
              iconFamily="Feather"
            />
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
};

interface SidebarMenuItemComponentProps {
  item: SidebarItem;
}

const SidebarMenuItemComponent: React.FC<SidebarMenuItemComponentProps> = ({ item }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemContent}>
        {item.iconFamily === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={item.icon} size={22} color={item.color || '#00D4FF'} />
        ) : (
          <Feather name={item.icon} size={22} color={item.color || '#00D4FF'} />
        )}
        <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
        {item.badge && (
          <View style={styles.badgeContainer}>
            <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

interface SidebarMenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconFamily?: 'MaterialCommunityIcons' | 'Feather';
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon,
  label,
  onPress,
  iconFamily = 'Feather',
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        {iconFamily === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={22} color="#00D4FF" />
        ) : (
          <Feather name={icon} size={22} color="#00D4FF" />
        )}
        <ThemedText style={styles.menuItemLabel}>{label}</ThemedText>
      </View>
    </Pressable>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconContainer}>
        <Feather name={icon} size={18} color="#00D4FF" />
      </View>
      <View style={styles.statContent}>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    borderRightColor: '#1a1a1a',
    borderRightWidth: 1,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 8,
    elevation: 12,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  version: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
  },
  nowPlayingSection: {
    margin: 16,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderColor: '#00D4FF30',
    borderWidth: 1,
  },
  nowPlayingLabel: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 8,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playingTime: {
    fontSize: 10,
    color: '#00D4FF',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  menuItemPressed: {
    backgroundColor: '#00D4FF15',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  badgeContainer: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  statsSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a15',
    borderRadius: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00D4FF15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
  settingsSection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
});
