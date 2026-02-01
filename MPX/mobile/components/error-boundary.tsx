import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * Error Boundary component to catch rendering errors
 * Displays user-friendly error message and recovery options
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error Boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);

    // Increment error count
    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorCount={this.state.errorCount}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function ErrorBoundaryFallback({
  error,
  errorCount,
  onReset,
}: {
  error: Error | null;
  errorCount: number;
  onReset: () => void;
}) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color="#FF3B30"
          style={styles.icon}
        />

        <ThemedText style={styles.title}>Something Went Wrong</ThemedText>

        <ThemedText style={styles.message}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </ThemedText>

        {errorCount > 2 && (
          <ThemedText style={styles.warning}>
            ⚠️ Multiple errors detected. The app might be unstable.
          </ThemedText>
        )}

        {__DEV__ && error && (
          <View style={styles.debugInfo}>
            <ThemedText style={styles.debugTitle}>Debug Info</ThemedText>
            <ThemedText style={styles.debugText}>{error.stack}</ThemedText>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Pressable style={styles.primaryButton} onPress={onReset}>
            <ThemedText style={styles.primaryButtonText}>Try Again</ThemedText>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              // Navigate to home or safe screen
              console.log('Navigate to home');
            }}
          >
            <ThemedText style={styles.secondaryButtonText}>
              Go Home
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  warning: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  debugInfo: {
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxHeight: 200,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});
