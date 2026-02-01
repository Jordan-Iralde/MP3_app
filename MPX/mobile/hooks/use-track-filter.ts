import { useMemo, useCallback, useState, useEffect } from 'react';
import { Track } from '@/types/Track';
import { searchHistoryService, SearchHistoryItem } from '@/services/search-history.service';

interface UseTrackFilterResult {
  filteredTracks: Track[];
  searchHistory: SearchHistoryItem[];
  isSearching: boolean;
  addToHistory: (term: string) => Promise<void>;
  removeFromHistory: (term: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

/**
 * Hook para filtrar tracks en tiempo real
 * Busca en nombre del track, artista y álbum
 * Usa useMemo para evitar recálculos innecesarios
 */
export const useTrackFilter = (
  tracks: Track[],
  searchTerm: string
): UseTrackFilterResult => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Suscribirse a cambios en el historial
  useEffect(() => {
    searchHistoryService.ready().then(() => {
      const history = searchHistoryService.getHistory();
      setSearchHistory(history);
    });

    const unsubscribe = searchHistoryService.subscribe((history) => {
      setSearchHistory(history);
    });

    return unsubscribe;
  }, []);

  // Filtrar tracks memoizado
  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) {
      return tracks;
    }

    const normalizedTerm = searchTerm.toLowerCase().trim();

    return tracks.filter((track) => {
      const title = track.title.toLowerCase();
      const artist = track.artist.toLowerCase();

      return (
        title.includes(normalizedTerm) ||
        artist.includes(normalizedTerm)
      );
    });
  }, [tracks, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;

  // Función para agregar al historial
  const addToHistory = useCallback(async (term: string) => {
    try {
      await searchHistoryService.addSearchTerm(term);
    } catch (error) {
      console.error('[useTrackFilter] Error adding to history:', error);
    }
  }, []);

  // Función para remover del historial
  const removeFromHistory = useCallback(async (term: string) => {
    try {
      await searchHistoryService.removeSearchTerm(term);
    } catch (error) {
      console.error('[useTrackFilter] Error removing from history:', error);
    }
  }, []);

  // Función para limpiar el historial
  const clearHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearAll();
    } catch (error) {
      console.error('[useTrackFilter] Error clearing history:', error);
    }
  }, []);

  return {
    filteredTracks,
    searchHistory,
    isSearching,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};

/**
 * Hook para agregar un término de búsqueda al historial
 */
export const useAddSearchHistory = () => {
  return useCallback(async (term: string) => {
    try {
      await searchHistoryService.addSearchTerm(term);
      console.log('[useAddSearchHistory] Term added:', term);
    } catch (error) {
      console.error('[useAddSearchHistory] Error:', error);
    }
  }, []);
};

/**
 * Hook para obtener el historial de búsqueda completo
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        await searchHistoryService.ready();
        const data = searchHistoryService.getHistory();
        setHistory(data);
      } catch (error) {
        console.error('[useSearchHistory] Error loading:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    const unsubscribe = searchHistoryService.subscribe((data) => {
      setHistory(data);
    });

    return unsubscribe;
  }, []);

  const addTerm = useCallback(async (term: string) => {
    await searchHistoryService.addSearchTerm(term);
  }, []);

  const removeTerm = useCallback(async (term: string) => {
    await searchHistoryService.removeSearchTerm(term);
  }, []);

  const clear = useCallback(async () => {
    await searchHistoryService.clearAll();
  }, []);

  return {
    history,
    isLoading,
    addTerm,
    removeTerm,
    clear,
  };
};
