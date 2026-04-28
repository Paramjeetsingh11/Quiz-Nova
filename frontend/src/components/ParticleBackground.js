import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withDelay, Easing, cancelAnimation,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

const PARTICLE_COLORS = [
  'rgba(168,85,247,0.6)',
  'rgba(124,58,237,0.5)',
  'rgba(6,182,212,0.5)',
  'rgba(236,72,153,0.4)',
  'rgba(99,102,241,0.5)',
  'rgba(103,232,249,0.4)',
];

const Particle = ({ x, y, size, color, duration, delay }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: duration * 0.4, easing: Easing.out(Easing.quad) }),
        -1,
        true
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-H * 0.35 - Math.random() * 80, { duration, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming((Math.random() - 0.5) * 60, { duration: duration * 0.7, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: duration * 0.5, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size,
          elevation: 4,
        },
        animStyle,
      ]}
    />
  );
};

const ParticleBackground = ({ count = 18, style }) => {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * W,
      y: Math.random() * H,
      size: 3 + Math.random() * 6,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: 4000 + Math.random() * 5000,
      delay: Math.random() * 3000,
    }))
  ).current;

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

export default ParticleBackground;
