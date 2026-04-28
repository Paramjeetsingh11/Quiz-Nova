import React, { useCallback } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, View,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients, Radius, FontSize, FontWeight, Shadows, Spacing } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedButton = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | accent | ghost | danger | gold
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.85);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    opacity.value = withSpring(1);
  }, []);

  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.93, { damping: 15 }),
      withSpring(1, { damping: 10 })
    );
    onPress?.();
  }, [disabled, loading, onPress]);

  const gradientMap = {
    primary: Gradients.primary,
    secondary: Gradients.secondary,
    accent: Gradients.accent,
    gold: Gradients.gold,
    danger: Gradients.danger,
    success: Gradients.success,
  };

  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 20, fontSize: FontSize.sm },
    md: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FontSize.md },
    lg: { paddingVertical: 20, paddingHorizontal: 36, fontSize: FontSize.lg },
  };

  const shadowMap = {
    primary: Shadows.glow,
    secondary: Shadows.glowCyan,
    accent: { shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 16 },
    gold: Shadows.glowGold,
    danger: { shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 14 },
    ghost: {},
  };

  const { paddingVertical, paddingHorizontal, fontSize } = sizeMap[size];
  const isGhost = variant === 'ghost';

  const content = (
    <View style={[styles.inner, { paddingVertical, paddingHorizontal }]}>
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.label, { fontSize }, textStyle]}>{title}</Text>
      )}
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animStyle,
        styles.base,
        { borderRadius: Radius.lg },
        fullWidth && { width: '100%' },
        !isGhost && shadowMap[variant],
        style,
      ]}
    >
      {isGhost ? (
        <View style={[styles.ghostContainer, { paddingVertical, paddingHorizontal }]}>
          {loading ? <ActivityIndicator color={Colors.primaryLight} size="small" /> : (
            <Text style={[styles.ghostLabel, { fontSize }, textStyle]}>{title}</Text>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={gradientMap[variant] || Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: Radius.lg }]}
        >
          {content}
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  gradient: {
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  ghostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
  },
  ghostLabel: {
    color: Colors.primaryLight,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});

export default AnimatedButton;
