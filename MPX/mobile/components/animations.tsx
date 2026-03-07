import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideLeft';
  duration?: number;
  delay?: number;
}

/**
 * Contenedor con animaciones personalizadas
 * Soporta: fadeIn, slideUp, scaleIn, slideLeft
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  let animatedStyle: any = {};

  switch (animation) {
    case 'fadeIn':
      animatedStyle = {
        opacity: animValue,
      };
      break;

    case 'slideUp':
      animatedStyle = {
        opacity: animValue,
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          },
        ],
      };
      break;

    case 'scaleIn':
      animatedStyle = {
        opacity: animValue,
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      };
      break;

    case 'slideLeft':
      animatedStyle = {
        opacity: animValue,
        transform: [
          {
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      };
      break;
  }

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

interface PulseAnimationProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
}

/**
 * Componente con animación de pulso
 */
export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  scale = 1.05,
  duration = 1000,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: scale,
          duration: duration / 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

/**
 * Skeleton loader con animación de shimmer
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 12,
  borderRadius = 4,
  marginBottom = 8,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          opacity,
        },
      ]}
    />
  );
};

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  threshold?: number;
}

/**
 * Gesto de deslizar para eliminar
 */
export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({ 
  children, 
  onDelete, 
  threshold = -100 
}) => {
  const offsetX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanGestureHandler({
      activeOffsetX: [-10, 10],
    })
  ).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: offsetX } }],
    { useNativeDriver: false }
  );

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View
        style={{
          transform: [{ translateX: offsetX }],
        }}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

interface ProgressAnimationProps {
  progress: number; // 0-1
  duration?: number;
  color?: string;
}

/**
 * Barra de progreso animada
 */
export const ProgressAnimation: React.FC<ProgressAnimationProps> = ({
  progress,
  duration = 500,
  color = '#00D4FF',
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressContainer, { backgroundColor: '#1a1a1a' }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

interface RotationAnimationProps {
  children: React.ReactNode;
  duration?: number;
  continuous?: boolean;
}

/**
 * Animación de rotación
 */
export const RotationAnimation: React.FC<RotationAnimationProps> = ({
  children,
  duration = 2000,
  continuous = true,
}) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (continuous) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }
  }, [continuous]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: rotation }],
      }}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1a1a1a',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
