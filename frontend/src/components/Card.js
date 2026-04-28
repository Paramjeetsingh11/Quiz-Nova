import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Spacing, Shadows } from '../theme';

const Card = ({
  children,
  style,
  variant = 'glass',  // glass | gradient | solid | bordered
  gradient,
  padding = Spacing.lg,
  borderRadius = Radius.xl,
  glow = false,
  blur = false,
}) => {
  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, { borderRadius, padding }, glow && Shadows.glow, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'glass' && blur) {
    return (
      <BlurView intensity={20} tint="dark" style={[styles.glass, { borderRadius, padding }, glow && Shadows.glow, style]}>
        <View style={styles.glassInner}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        variant === 'glass' && styles.glass,
        variant === 'solid' && styles.solid,
        variant === 'bordered' && styles.bordered,
        { borderRadius, padding },
        glow && Shadows.glow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    ...Shadows.card,
  },
  glass: {
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  solid: {
    backgroundColor: Colors.bgCard,
  },
  bordered: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  glassInner: {
    flex: 1,
  },
});

export default Card;
