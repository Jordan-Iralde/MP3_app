import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  View,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SearchHistoryItem } from '@/services/search-history.service';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (term: string) => void;
  onClearSearch: () => void;
  searchHistory: SearchHistoryItem[];
  onHistoryItemPress: (term: string) => void;
  onRemoveHistoryItem: (term: string) => void;
  onClearHistory: () => void;
  isSearching: boolean;
  placeholder?: string;
}

/**
 * Componente de barra de búsqueda con historial
 */
export const SearchBar = memo(
  ({
    value,
    onChangeText,
    onSearch,
    onClearSearch,
    searchHistory,
    onHistoryItemPress,
    onRemoveHistoryItem,
    onClearHistory,
    isSearching,
    placeholder = 'Buscar canciones...',
  }: SearchBarProps) => {
    const [showHistory, setShowHistory] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    // Animar entrada de historial
    const toggleHistory = useCallback(() => {
      Animated.timing(fadeAnim, {
        toValue: showHistory ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setShowHistory(!showHistory);
    }, [showHistory, fadeAnim]);

    const handleClear = useCallback(() => {
      onChangeText('');
      onClearSearch();
    }, [onChangeText, onClearSearch]);

    const handleHistoryItemPress = useCallback(
      (term: string) => {
        onChangeText(term);
        onHistoryItemPress(term);
        setShowHistory(false);
      },
      [onChangeText, onHistoryItemPress]
    );

    const renderHistoryItem = useCallback(
      ({ item }: { item: SearchHistoryItem }) => (
        <Pressable
          style={styles.historyItem}
          onPress={() => handleHistoryItemPress(item.term)}
        >
          <View style={styles.historyItemContent}>
            <MaterialCommunityIcons
              name="history"
              size={18}
              color="#999"
              style={styles.historyIcon}
            />
            <ThemedText style={styles.historyItemText}>{item.term}</ThemedText>
          </View>
          <Pressable
            onPress={() => onRemoveHistoryItem(item.term)}
            style={styles.removeHistoryButton}
          >
            <MaterialCommunityIcons name="close" size={18} color="#FF6B6B" />
          </Pressable>
        </Pressable>
      ),
      [handleHistoryItemPress, onRemoveHistoryItem]
    );

    return (
      <>
        <ThemedView style={styles.container}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={() => onSearch(value)}
              returnKeyType="search"
              placeholderTextColor="#999"
            />
            {value.length > 0 && (
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#FF6B6B" />
              </Pressable>
            )}
          </View>

          {value.length > 0 && (
            <Pressable
              onPress={() => onSearch(value)}
              style={styles.searchButton}
            >
              <ThemedText style={styles.searchButtonText}>Buscar</ThemedText>
            </Pressable>
          )}
        </ThemedView>

        {/* Historial de búsqueda */}
        {!isSearching && searchHistory.length > 0 && (
          <ThemedView style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <ThemedText style={styles.historyTitle}>Búsquedas recientes</ThemedText>
              <Pressable onPress={onClearHistory}>
                <ThemedText style={styles.clearHistoryButton}>Borrar</ThemedText>
              </Pressable>
            </View>
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.timestamp.toString()}
              scrollEnabled={false}
            />
          </ThemedView>
        )}

        {/* Modal para historial completo */}
        <Modal
          visible={showHistory}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHistory(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowHistory(false)}
          >
            <Animated.View
              style={[
                styles.historyModal,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Historial de búsqueda
                </ThemedText>
                <Pressable onPress={() => setShowHistory(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#007AFF" />
                </Pressable>
              </View>

              {searchHistory.length > 0 ? (
                <>
                  <FlatList
                    data={searchHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.timestamp.toString()}
                    style={styles.historyList}
                  />
                  <Pressable
                    onPress={onClearHistory}
                    style={styles.clearAllButton}
                  >
                    <MaterialCommunityIcons
                      name="trash-can"
                      size={18}
                      color="#FF6B6B"
                    />
                    <ThemedText style={styles.clearAllText}>
                      Borrar todo
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <ThemedView style={styles.emptyHistoryContainer}>
                  <MaterialCommunityIcons
                    name="history"
                    size={48}
                    color="#CCC"
                  />
                  <ThemedText style={styles.emptyHistoryText}>
                    Sin historial de búsqueda
                  </ThemedText>
                </ThemedView>
              )}
            </Animated.View>
          </Pressable>
        </Modal>
      </>
    );
  }
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  historyContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 300,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  clearHistoryButton: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    marginRight: 8,
  },
  historyItemText: {
    fontSize: 14,
    flex: 1,
  },
  removeHistoryButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  historyModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  clearAllText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyHistoryText: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 12,
  },
});
