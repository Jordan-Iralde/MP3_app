import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Global toast queue
let toastQueue: ToastMessage[] = [];
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];

export const toastService = {
  show: (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000,
    action?: { label: string; onPress: () => void }
  ) => {
    const id = Math.random().toString(36);
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration,
      action,
    };

    toastQueue.push(toast);
    notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        toastService.dismiss(id);
      }, duration);
    }

    return id;
  },

  success: (message: string, duration?: number) =>
    toastService.show(message, 'success', duration),
  error: (message: string, duration?: number) =>
    toastService.show(message, 'error', duration),
  warning: (message: string, duration?: number) =>
    toastService.show(message, 'warning', duration),
  info: (message: string, duration?: number) => toastService.show(message, 'info', duration),

  dismiss: (id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notifyListeners();
  },

  clear: () => {
    toastQueue = [];
    notifyListeners();
  },

  subscribe: (listener: (toasts: ToastMessage[]) => void) => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  },
};

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastQueue]));
};

interface ToastContainerProps {
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ maxToasts = 3 }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toastService.subscribe((newToasts) => {
      setToasts(newToasts.slice(0, maxToasts));
    });
  }, [maxToasts]);

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => toastService.dismiss(toast.id)}
          action={toast.action}
        />
      ))}
    </View>
  );
};

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  action?: { label: string; onPress: () => void };
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, action }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    setIsRemoving(true);
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const getToastStyle = () => {
    const baseStyle = {
      backgroundColor: '',
      borderColor: '',
      iconColor: '',
      icon: '',
    };

    switch (type) {
      case 'success':
        return {
          backgroundColor: '#1a3a1a',
          borderColor: '#00D400',
          iconColor: '#00D400',
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: '#3a1a1a',
          borderColor: '#FF6B6B',
          iconColor: '#FF6B6B',
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: '#3a3a1a',
          borderColor: '#FFA500',
          iconColor: '#FFA500',
          icon: 'alert',
        };
      case 'info':
        return {
          backgroundColor: '#1a2a3a',
          borderColor: '#00D4FF',
          iconColor: '#00D4FF',
          icon: 'info',
        };
      default:
        return baseStyle;
    }
  };

  const style = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toastContent,
          {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
        ]}
      >
        <Feather name={style.icon as any} size={20} color={style.iconColor} />
        <ThemedText style={styles.toastMessage}>{message}</ThemedText>

        {action && (
          <Pressable
            onPress={() => {
              action.onPress();
              handleClose();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <ThemedText style={styles.actionText}>{action.label}</ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
        >
          <Feather name="x" size={16} color="#AAA" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

interface FeedbackBubbleProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'loading';
  onDismiss?: () => void;
}

export const FeedbackBubble: React.FC<FeedbackBubbleProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && type !== 'loading') {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Feather name="check" size={24} color="#00D400" />;
      case 'error':
        return <Feather name="x" size={24} color="#FF6B6B" />;
      case 'loading':
        return <MaterialCommunityIcons name="loading" size={24} color="#00D4FF" />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.feedbackBubble,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.feedbackContent}>
        {getIcon()}
        <ThemedText style={styles.feedbackText}>{message}</ThemedText>
      </View>
    </Animated.View>
  );
};

interface HapticFeedbackButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  feedback?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
}

export const HapticFeedbackButton: React.FC<HapticFeedbackButtonProps> = ({
  children,
  onPress,
  feedback = 'medium',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    // Animación de presión
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
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

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable onPress={handlePress} disabled={disabled}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

interface ProgressIndicatorProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 60,
  strokeWidth = 3,
}) => {
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={[
          styles.circleProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#1a1a1a',
          },
        ]}
      >
        <View
          style={[
            styles.circleProgressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: '#00D4FF',
              borderRightColor: '#00D4FF',
              transform: [{ rotate: `${progress * 360}deg` }],
            },
          ]}
        />
        <ThemedText
          style={{
            position: 'absolute',
            fontSize: 14,
            fontWeight: '700',
            color: '#FFF',
          }}
        >
          {Math.round(progress * 100)}%
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 12,
    zIndex: 1000,
  },
  toast: {
    marginBottom: 12,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#1a2a3a',
    borderColor: '#00D4FF',
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D4FF',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonPressed: {
    opacity: 0.5,
  },
  feedbackBubble: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0a0a0a',
    borderColor: '#00D4FF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
  },
  feedbackContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  circleProgress: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleProgressFill: {
    position: 'absolute',
  },
});
