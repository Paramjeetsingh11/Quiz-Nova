import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, withSequence, withRepeat, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ParticleBackground from '../components/ParticleBackground';
import { Colors, Gradients, FontSize, FontWeight } from '../theme';
import useAuthStore from '../store/authStore';

const { width: W, height: H } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { isHydrated, isAuthenticated, hydrate } = useAuthStore();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-15);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.5);
  const ringOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Hydrate auth state from SecureStore
    hydrate();

    // Ring pulse
    ringOpacity.value = withDelay(200, withTiming(0.6, { duration: 600 }));
    ringScale.value = withDelay(200, withSpring(1.2, { damping: 12 }));

    // Logo entrance
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 120 }));
    logoRotate.value = withDelay(400, withSpring(0, { damping: 14 }));

    // Pulse
    pulseScale.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sine) }),
      ), -1, false
    ));

    // Title
    titleOpacity.value = withDelay(900, withTiming(1, { duration: 700 }));
    titleY.value = withDelay(900, withSpring(0, { damping: 14 }));

    // Tagline
    taglineOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
  }, []);

  // Navigate after hydration
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isHydrated, isAuthenticated]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0a0014', '#12003a', '#07000F']}
        style={StyleSheet.absoluteFill}
      />
      <ParticleBackground count={24} />

      {/* Glow ring */}
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.ringOuter, ringStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <LinearGradient
          colors={Gradients.heroFull}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoEmoji}>⚡</Text>
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>
          Quiz<Text style={styles.titleHighlight}>Nova</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>AI-Powered Quiz Battle Platform</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { opacity: 0.5 + i * 0.2 }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.5)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },
  ringOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  logoEmoji: {
    fontSize: 64,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: FontWeight.black,
    color: Colors.white,
    letterSpacing: -1,
  },
  titleHighlight: {
    color: Colors.primaryLight,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
});

export default SplashScreen;
