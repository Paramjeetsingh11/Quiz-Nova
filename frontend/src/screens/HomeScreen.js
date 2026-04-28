import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, StatusBar as RNStatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import AnimatedButton from '../components/AnimatedButton';
import ParticleBackground from '../components/ParticleBackground';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius, Shadows } from '../theme';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';

const { width: W } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: 'quiz', label: 'Start Quiz', icon: 'flash', gradient: Gradients.primary, screen: 'Quiz', glow: Colors.primary },
  { id: 'ai', label: 'AI Quiz', icon: 'sparkles', gradient: Gradients.secondary, screen: 'AIQuiz', glow: Colors.secondary },
  { id: 'battle', label: 'Battle', icon: 'sword', gradient: Gradients.battle, screen: 'Battle', glow: Colors.accent },
  { id: 'board', label: 'Leaderboard', icon: 'trophy', gradient: Gradients.gold, screen: 'Leaderboard', glow: Colors.gold },
];

const TOPICS = [
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'math', label: 'Math', emoji: '🔢' },
  { id: 'pop-culture', label: 'Pop Culture', emoji: '🎬' },
];

const StatBadge = ({ label, value, icon, color, delay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.statBadge, style]}>
      <LinearGradient colors={[color + '30', color + '10']} style={styles.statGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { profile, fetchProfile, isLoading } = useUserStore();
  const { logout } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  const pulseGlow = useSharedValue(0.4);

  useEffect(() => {
    fetchProfile();
    headerOpacity.value = withTiming(1, { duration: 700 });
    headerY.value = withSpring(0, { damping: 14 });
    pulseGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
      ), -1, false
    );
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpForNext = level * 500;
  const xpProgress = Math.min(xp / xpForNext, 1);
  const streak = profile?.streak || 0;
  const accuracy = profile?.accuracy || 0;

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />
      <ParticleBackground count={16} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Top bar */}
        <Animated.View style={[styles.topBar, headerStyle]}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
            <Text style={styles.username}>{profile?.username || 'Champion'}</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Analytics')}>
              <Ionicons name="stats-chart" size={20} color={Colors.primaryLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={Gradients.primaryVibrant} style={styles.avatarCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.avatarText}>{(profile?.username || 'U').charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* XP Card */}
        <Card style={styles.xpCard} variant="glass" glow>
          <LinearGradient colors={['rgba(124,58,237,0.2)', 'rgba(6,182,212,0.05)']} style={StyleSheet.absoluteFill} />
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelValue}>{level}</Text>
            </View>
            <View style={styles.xpRight}>
              <Text style={styles.xpValue}>{xp.toLocaleString()} XP</Text>
              <Text style={styles.xpNext}>/ {xpForNext.toLocaleString()} XP to next level</Text>
            </View>
          </View>
          <View style={{ marginTop: Spacing.md }}>
            <ProgressBar progress={xpProgress} height={10} gradient={Gradients.heroFull} showGlow />
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBadge label="Streak" value={`${streak}🔥`} icon="🔥" color={Colors.gold} delay={100} />
          <StatBadge label="Accuracy" value={`${accuracy}%`} icon="🎯" color={Colors.green} delay={200} />
          <StatBadge label="Level" value={`#${level}`} icon="⭐" color={Colors.primaryLight} delay={300} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <ActionCard key={action.id} action={action} delay={i * 80} navigation={navigation} />
          ))}
        </View>

        {/* Topic Selector */}
        <Text style={styles.sectionTitle}>Browse Topics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
          {TOPICS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.topicChip}
              onPress={() => navigation.navigate('Quiz', { topic: t.id })}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['rgba(124,58,237,0.2)', 'rgba(79,70,229,0.1)']} style={styles.topicChipInner}>
                <Text style={styles.topicEmoji}>{t.emoji}</Text>
                <Text style={styles.topicLabel}>{t.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomBtns}>
          <AnimatedButton title="View Leaderboard 🏆" onPress={() => navigation.navigate('Leaderboard')} variant="secondary" size="md" />
          <AnimatedButton title="Logout" onPress={handleLogout} variant="ghost" size="md" style={{ marginTop: Spacing.sm }} />
        </View>
      </ScrollView>
    </View>
  );
};

const ActionCard = ({ action, delay, navigation }) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.actionCard, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(action.screen)}
        style={styles.actionTouch}
      >
        <LinearGradient colors={action.gradient} style={styles.actionGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={action.icon} size={28} color={Colors.white} />
          <Text style={styles.actionLabel}>{action.label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, paddingTop: (RNStatusBar.currentHeight || 44) + Spacing.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  greeting: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  username: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.black },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn: {
    width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.bgGlass,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  avatarBtn: {},
  avatarCircle: { width: 46, height: 46, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.white },
  xpCard: { marginBottom: Spacing.lg, overflow: 'hidden' },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  levelLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.bold, letterSpacing: 1.5 },
  levelValue: { fontSize: 40, fontWeight: FontWeight.black, color: Colors.white, lineHeight: 44 },
  xpRight: { alignItems: 'flex-end' },
  xpValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.primaryLight },
  xpNext: { fontSize: FontSize.xs, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statBadge: { flex: 1 },
  statGrad: { borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: 0.3 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionCard: { width: (W - Spacing.lg * 2 - Spacing.sm) / 2 },
  actionTouch: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.glow },
  actionGrad: { paddingVertical: Spacing.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  actionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  topicsRow: { paddingBottom: Spacing.md, gap: Spacing.sm },
  topicChip: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  topicChipInner: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, alignItems: 'center', gap: 4 },
  topicEmoji: { fontSize: 22 },
  topicLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  bottomBtns: { marginTop: Spacing.xl },
});

export default HomeScreen;
