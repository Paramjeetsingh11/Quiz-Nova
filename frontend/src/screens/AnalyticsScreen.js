import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import Card from '../components/Card';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useUserStore from '../store/userStore';

const { width: W } = Dimensions.get('window');

const BAR_DATA = [
  { day: 'Mon', value: 0.65 },
  { day: 'Tue', value: 0.8 },
  { day: 'Wed', value: 0.45 },
  { day: 'Thu', value: 0.9 },
  { day: 'Fri', value: 0.7 },
  { day: 'Sat', value: 1.0 },
  { day: 'Sun', value: 0.55 },
];

const StatRow = ({ label, value, icon, color, progress, delay }) => {
  const opacity = useSharedValue(0);
  const x = useSharedValue(-30);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    x.value = withDelay(delay, withSpring(0, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: x.value }] }));
  return (
    <Animated.View style={[styles.statRow, style]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <View style={styles.statLabelRow}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
        <ProgressBar progress={progress} height={6} gradient={[color, color + 'AA']} showGlow={false} style={{ marginTop: 6 }} />
      </View>
    </Animated.View>
  );
};

const AnimBar = ({ item, maxH = 100, delay }) => {
  const height = useSharedValue(0);
  useEffect(() => {
    height.value = withDelay(delay, withSpring(item.value * maxH, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ height: height.value }));
  return (
    <View style={styles.barSlot}>
      <View style={[styles.barTrack, { height: maxH }]}>
        <Animated.View style={[styles.barFill, style]}>
          <LinearGradient colors={Gradients.primaryVibrant} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <Text style={styles.barDay}>{item.day}</Text>
    </View>
  );
};

const AnalyticsScreen = ({ navigation }) => {
  const { profile, fetchProfile } = useUserStore();
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  const accuracy = profile?.accuracy || 72;
  const totalQuizzes = profile?.totalQuizzes || 48;
  const avgScore = profile?.avgScore || 68;
  const streak = profile?.streak || 5;
  const xp = profile?.xp || 2400;
  const level = profile?.level || 5;

  const ACHIEVEMENTS = [
    { emoji: '🔥', label: 'On Fire', desc: '5-day streak', unlocked: streak >= 5 },
    { emoji: '🎯', label: 'Sharpshooter', desc: '80%+ accuracy', unlocked: accuracy >= 80 },
    { emoji: '⚡', label: 'Speed Demon', desc: 'Answer in <5s', unlocked: true },
    { emoji: '🏆', label: 'Champion', desc: 'Top 10 rank', unlocked: false },
    { emoji: '🤖', label: 'AI Master', desc: '10 AI quizzes', unlocked: totalQuizzes >= 10 },
    { emoji: '💎', label: 'Diamond', desc: 'Reach Level 10', unlocked: level >= 10 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSub}>Your performance insights</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview cards */}
        <View style={styles.overviewRow}>
          {[
            { label: 'Total Quizzes', value: totalQuizzes, icon: '📝', color: Colors.primaryLight },
            { label: 'Avg Score', value: `${avgScore}%`, icon: '📊', color: Colors.secondaryLight },
            { label: 'Best Streak', value: `${streak}🔥`, icon: '🔥', color: Colors.gold },
            { label: 'Total XP', value: xp.toLocaleString(), icon: '⚡', color: Colors.green },
          ].map((item, i) => (
            <Animated.View key={i} style={[styles.overviewCard,
              { opacity: withDelay(i * 80, withTiming(1, { duration: 500 })) }]}>
              <LinearGradient colors={[item.color + '20', item.color + '08']} style={styles.overviewGrad}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                <Text style={[styles.overviewValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.overviewLabel}>{item.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Weekly Activity */}
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <Card variant="glass" style={styles.chartCard}>
          <Text style={styles.chartLabel}>Quiz Score by Day</Text>
          <View style={styles.barsRow}>
            {BAR_DATA.map((item, i) => (
              <AnimBar key={item.day} item={item} maxH={90} delay={i * 80} />
            ))}
          </View>
        </Card>

        {/* Performance Stats */}
        <Text style={styles.sectionTitle}>Performance Stats</Text>
        <Card variant="glass" style={styles.statsCard}>
          <StatRow label="Accuracy" value={`${accuracy}%`} icon="🎯" color={Colors.green} progress={accuracy / 100} delay={100} />
          <View style={styles.divider} />
          <StatRow label="Avg Score" value={`${avgScore}%`} icon="📊" color={Colors.secondary} progress={avgScore / 100} delay={200} />
          <View style={styles.divider} />
          <StatRow label="Level Progress" value={`Lvl ${level}`} icon="⭐" color={Colors.primaryLight} progress={(xp % 500) / 500} delay={300} />
          <View style={styles.divider} />
          <StatRow label="Streak" value={`${streak} days`} icon="🔥" color={Colors.gold} progress={Math.min(streak / 30, 1)} delay={400} />
        </Card>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achGrid}>
          {ACHIEVEMENTS.map((ach, i) => (
            <Animated.View key={i} style={[styles.achCard,
              !ach.unlocked && styles.achLocked,
              { opacity: withDelay(i * 60, withTiming(ach.unlocked ? 1 : 0.5, { duration: 400 })) }]}>
              <LinearGradient
                colors={ach.unlocked ? Gradients.primaryVibrant : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.achGrad}
              >
                <Text style={{ fontSize: 28 }}>{ach.emoji}</Text>
                <Text style={[styles.achLabel, !ach.unlocked && { color: Colors.textMuted }]}>{ach.label}</Text>
                <Text style={styles.achDesc}>{ach.desc}</Text>
                {!ach.unlocked && <Text style={styles.achLock}>🔒</Text>}
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgGlass, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  overviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  overviewCard: { width: (W - Spacing.lg * 2 - Spacing.sm) / 2, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight },
  overviewGrad: { padding: Spacing.md, alignItems: 'center', gap: 4 },
  overviewValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  overviewLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: 0.3 },
  chartCard: { marginBottom: Spacing.xl },
  chartLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: Spacing.lg },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barSlot: { alignItems: 'center', flex: 1 },
  barTrack: { width: '60%', backgroundColor: Colors.bgGlassStrong, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6, overflow: 'hidden', minHeight: 4 },
  barDay: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6, fontWeight: FontWeight.medium },
  statsCard: { marginBottom: Spacing.xl },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  statIconBox: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  statInfo: { flex: 1 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  achCard: { width: (W - Spacing.lg * 2 - Spacing.sm * 2) / 3, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  achLocked: { borderColor: Colors.borderLight },
  achGrad: { padding: Spacing.sm, alignItems: 'center', gap: 4 },
  achLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.white, textAlign: 'center' },
  achDesc: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  achLock: { fontSize: 12, marginTop: 2 },
});

export default AnalyticsScreen;
