import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { AppSidebar } from './app-sidebar';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
    badge?: number;
  };
  showSearch?: boolean;
  onSearchChange?: (text: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  onMenuPress,
  rightAction,
  showSearch = false,
  onSearchChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { width } = useWindowDimensions();

  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  const handleMenuPress = () => {
    setSidebarOpen(true);
    onMenuPress?.();
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerContainer}>
          {/* Left section */}
          <View style={styles.leftSection}>
            {showBackButton ? (
              <Pressable
                onPress={onBackPress}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
              >
                <Feather name="chevron-left" size={24} color="#00D4FF" />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleMenuPress}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
              >
                <MaterialCommunityIcons name="menu" size={24} color="#00D4FF" />
              </Pressable>
            )}
          </View>

          {/* Center section */}
          <View style={styles.centerSection}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            )}
          </View>

          {/* Right section */}
          <View style={styles.rightSection}>
            {showSearch && (
              <Pressable
                onPress={() => setSearchActive(!searchActive)}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
              >
                <Feather name={searchActive ? 'x' : 'search'} size={24} color="#00D4FF" />
              </Pressable>
            )}

            {rightAction && (
              <Pressable
                onPress={rightAction.onPress}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={rightAction.icon as any}
                  size={24}
                  color="#00D4FF"
                />
                {rightAction.badge && rightAction.badge > 0 && (
                  <View style={styles.badgeContainer}>
                    <ThemedText style={styles.badgeText}>
                      {rightAction.badge > 99 ? '99+' : rightAction.badge}
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Search bar */}
        {showSearch && searchActive && (
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#AAA" />
            {/* You can add a TextInput here if needed */}
          </View>
        )}
      </SafeAreaView>

      {/* Sidebar */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(screen) => {
          // Handle navigation if needed
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0a0a0a',
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    minHeight: 56,
  },
  leftSection: {
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 40,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPressed: {
    backgroundColor: '#00D4FF15',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderColor: '#00D4FF30',
    borderWidth: 1,
    gap: 8,
  },
});
