import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStoragePermission } from '@/hooks/use-storage-permission';

export default function HomeScreen() {
  const { isGranted, isLoading, error } = useStoragePermission();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Resonix
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your offline-first MP3 player
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {isLoading && (
          <ThemedText style={styles.statusText}>
            Initializing...
          </ThemedText>
        )}

        {!isLoading && error && (
          <ThemedView style={styles.errorBox}>
            <ThemedText style={styles.errorText}>
              ⚠️ Permission Error
            </ThemedText>
            <ThemedText style={styles.errorDescription}>
              {error.message}
            </ThemedText>
          </ThemedView>
        )}

        {!isLoading && !error && !isGranted && (
          <ThemedView style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              ⚙️ Permissions Required
            </ThemedText>
            <ThemedText style={styles.warningDescription}>
              Storage access is needed to read your music files.
            </ThemedText>
          </ThemedView>
        )}

        {!isLoading && isGranted && (
          <ThemedView style={styles.successBox}>
            <ThemedText style={styles.successText}>
              ✓ Ready to Go
            </ThemedText>
            <ThemedText style={styles.successDescription}>
              Storage permissions granted. v0.1 bootstrap complete.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.versionText}>
          v0.1 — Bootstrap funcional
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#E53E3E',
  },
  errorDescription: {
    fontSize: 14,
    color: '#C53030',
  },
  warningBox: {
    backgroundColor: '#FFFAF0',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ED8936',
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ED8936',
  },
  warningDescription: {
    fontSize: 14,
    color: '#DD6B20',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#22C55E',
  },
  successDescription: {
    fontSize: 14,
    color: '#16A34A',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});
