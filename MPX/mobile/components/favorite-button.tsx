import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { favoritesService } from '@/services/favorites.service';

interface FavoriteButtonProps {
  trackUri: string;
  size?: number;
  color?: string;
  filledColor?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  trackUri,
  size = 24,
  color = '#999999',
  filledColor = '#FF6B6B',
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsFavorite(favoritesService.isFavorite(trackUri));

    // Subscribe to changes
    const unsubscribe = favoritesService.subscribe((favorites) => {
      setIsFavorite(favorites[trackUri]?.isFavorite ?? false);
    });

    return unsubscribe;
  }, [trackUri]);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      const newState = await favoritesService.toggleFavorite(trackUri);
      setIsFavorite(newState);
      onToggle?.(newState);
    } catch (error) {
      console.error('[FavoriteButton] Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather
        name={isFavorite ? 'heart' : 'heart'}
        size={size}
        color={isFavorite ? filledColor : color}
        fill={isFavorite ? filledColor : 'none'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
