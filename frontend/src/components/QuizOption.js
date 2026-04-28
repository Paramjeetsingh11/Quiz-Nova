import React, { useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, FontSize, FontWeight, Spacing, Gradients } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuizOption = ({
  label,          // 'A' | 'B' | 'C' | 'D'
  text,
  isSelected,
  isCorrect,      // shown after reveal
  isWrong,        // shown after reveal
  onPress,
  disabled = false,
  index = 0,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePress = useCallback(async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 8 });
    });
    glow.value = withTiming(0.8, { duration: 200 }, () => {
      glow.value = withTiming(0, { duration: 400 });
    });
    onPress?.();
  }, [disabled, onPress]);

  const getContainerStyle = () => {
    if (isCorrect) return styles.correct;
    if (isWrong) return styles.wrong;
    if (isSelected) return styles.selected;
    return styles.idle;
  };

  const getLabelStyle = () => {
    if (isCorrect) return styles.labelCorrect;
    if (isWrong) return styles.labelWrong;
    if (isSelected) return styles.labelSelected;
    return styles.labelIdle;
  };

  const getShadowColor = () => {
    if (isCorrect) return Colors.green;
    if (isWrong) return Colors.red;
    if (isSelected) return Colors.primary;
    return Colors.primary;
  };

  const labelColors = isCorrect
    ? Gradients.success
    : isWrong
    ? Gradients.danger
    : isSelected
    ? Gradients.primaryVibrant
    : ['rgba(124,58,237,0.3)', 'rgba(79,70,229,0.3)'];

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}
      style={[
        styles.container,
        getContainerStyle(),
        animStyle,
        { shadowColor: getShadowColor() },
      ]}
    >
      <LinearGradient
        colors={labelColors}
        style={styles.labelBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.labelText, getLabelStyle()]}>{label}</Text>
      </LinearGradient>
      <Text style={[styles.optionText, (isCorrect || isWrong || isSelected) && styles.optionTextActive]}>
        {text}
      </Text>
      {isCorrect && <Text style={styles.checkmark}>✓</Text>}
      {isWrong && <Text style={styles.cross}>✗</Text>}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  idle: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderColor: 'rgba(124,58,237,0.25)',
    shadowOpacity: 0,
  },
  selected: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: Colors.primary,
    shadowOpacity: 0.5,
  },
  correct: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: Colors.green,
    shadowOpacity: 0.6,
    shadowColor: Colors.green,
  },
  wrong: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: Colors.red,
    shadowOpacity: 0.5,
    shadowColor: Colors.red,
  },
  labelBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  labelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  labelIdle: { color: Colors.textSecondary },
  labelSelected: { color: Colors.white },
  labelCorrect: { color: Colors.white },
  labelWrong: { color: Colors.white },
  optionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  optionTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  checkmark: { fontSize: 18, color: Colors.green, marginLeft: Spacing.sm },
  cross: { fontSize: 18, color: Colors.red, marginLeft: Spacing.sm },
});

export default QuizOption;
