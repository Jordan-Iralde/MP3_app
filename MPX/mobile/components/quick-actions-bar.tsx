import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { usePlayerStore } from '@/store/playerStore';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  iconFamily: 'Feather' | 'MaterialCommunityIcons';
  onPress: () => void;
  badge?: number;
  color?: string;
}

interface QuickActionsBarProps {
  onActionPress?: (actionId: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onActionPress }) => {
  const { playerState, playerQueue, togglePlayPause } = usePlayer();
  const { showFavoritesOnly, toggleFavorites } = usePlayerStore();
  const { width } = useWindowDimensions();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'play-pause',
      label: playerState.isPlaying ? 'Pausar' : 'Reproducir',
      icon: playerState.isPlaying ? 'pause-circle' : 'play-circle',
      iconFamily: 'MaterialCommunityIcons',
      onPress: togglePlayPause,
      color: '#00D4FF',
    },
    {
      id: 'shuffle',
      label: 'Shuffle',
      icon: 'shuffle',
      iconFamily: 'Feather',
      onPress: () => {
        onActionPress?.('shuffle');
      },
    },
    {
      id: 'repeat',
      label: 'Repetir',
      icon: 'repeat',
      iconFamily: 'Feather',
      onPress: () => {
        onActionPress?.('repeat');
      },
    },
    {
      id: 'favorites',
      label: showFavoritesOnly ? 'Todos' : 'Favoritos',
      icon: showFavoritesOnly ? 'heart' : 'heart-outline',
      iconFamily: 'MaterialCommunityIcons',
      onPress: toggleFavorites,
      color: showFavoritesOnly ? '#FF6B6B' : undefined,
    },
    {
      id: 'queue',
      label: 'Cola',
      icon: 'list',
      iconFamily: 'Feather',
      onPress: () => {
        onActionPress?.('queue');
      },
      badge: playerQueue.length,
    },
    {
      id: 'sleep-timer',
      label: 'Timer',
      icon: 'clock',
      iconFamily: 'Feather',
      onPress: () => {
        onActionPress?.('sleep-timer');
      },
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            action={action}
            isSelected={selectedAction === action.id}
            onPress={() => {
              setSelectedAction(action.id);
              action.onPress();
              onActionPress?.(action.id);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface QuickActionButtonProps {
  action: QuickAction;
  isSelected: boolean;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, isSelected, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const IconComponent =
    action.iconFamily === 'Feather' ? Feather : MaterialCommunityIcons;

  return (
    <Animated.View
      style={[
        styles.actionButtonContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.actionButton,
          isSelected && styles.actionButtonSelected,
          pressed && styles.actionButtonPressed,
        ]}
      >
        <IconComponent
          name={action.icon as any}
          size={22}
          color={action.color || '#00D4FF'}
        />

        {action.badge && action.badge > 0 && (
          <View style={styles.actionBadge}>
            <ThemedText style={styles.badgeText}>
              {action.badge > 99 ? '99+' : action.badge}
            </ThemedText>
          </View>
        )}
      </Pressable>

      <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
    </Animated.View>
  );
};

/**
 * Barra de acciones rápidas minimalista (alternativa compacta)
 */
interface CompactQuickBarProps {
  onAction?: (actionId: string) => void;
}

export const CompactQuickBar: React.FC<CompactQuickBarProps> = ({ onAction }) => {
  const { playerState, togglePlayPause } = usePlayer();

  return (
    <View style={styles.compactContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.compactButton,
          pressed && styles.compactButtonPressed,
        ]}
        onPress={togglePlayPause}
      >
        <MaterialCommunityIcons
          name={playerState.isPlaying ? 'pause' : 'play'}
          size={20}
          color="#000"
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.compactButton,
          pressed && styles.compactButtonPressed,
        ]}
        onPress={() => onAction?.('queue')}
      >
        <Feather name="list" size={20} color="#000" />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.compactButton,
          pressed && styles.compactButtonPressed,
        ]}
        onPress={() => onAction?.('shuffle')}
      >
        <Feather name="shuffle" size={20} color="#000" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderTopColor: '#1a1a1a',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButtonContainer: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionButtonSelected: {
    backgroundColor: '#00D4FF15',
    borderColor: '#00D4FF',
    borderWidth: 1,
  },
  actionButtonPressed: {
    backgroundColor: '#00D4FF20',
  },
  actionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AAA',
    textAlign: 'center',
    maxWidth: 48,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderTopColor: '#1a1a1a',
    borderTopWidth: 1,
  },
  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonPressed: {
    opacity: 0.8,
  },
});
