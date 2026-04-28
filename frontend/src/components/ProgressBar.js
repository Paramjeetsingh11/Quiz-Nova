import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Gradients } from '../theme';

const ProgressBar = ({
  progress = 0,         // 0 to 1
  height = 8,
  color,                // overrides gradient
  gradient,             // array of colors
  backgroundColor = Colors.bgGlassStrong,
  animated = true,
  borderRadius,
  style,
  showGlow = true,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (animated) {
      width.value = withTiming(clamped, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    } else {
      width.value = clamped;
    }
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const br = borderRadius ?? height / 2;
  const grad = gradient || Gradients.primaryVibrant;

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: br, backgroundColor },
        style,
      ]}
    >
      <Animated.View style={[styles.fill, animStyle, { borderRadius: br }]}>
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: br }]}
        />
        {showGlow && (
          <View
            style={[
              styles.glow,
              { borderRadius: br, shadowColor: grad[0] || Colors.primary },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    right: 0,
    top: -4,
    bottom: -4,
    width: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProgressBar;
