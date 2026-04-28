import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withSpring, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import AnimatedButton from '../components/AnimatedButton';
import Card from '../components/Card';
import ParticleBackground from '../components/ParticleBackground';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useUserStore from '../store/userStore';

const { width: W } = Dimensions.get('window');
const BATTLE_DURATION = 60;

const MOCK_OPPONENT = { username: 'NovaMaster', level: 12, avatar: 'N', score: 0 };

const BattleScreen = ({ navigation }) => {
  const { profile } = useUserStore();
  const [phase, setPhase] = useState('matchmaking'); // matchmaking | countdown | battle | result
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);

  const pulseScale = useSharedValue(1);
  const matchOpacity = useSharedValue(0);
  const vsScale = useSharedValue(0);

  useEffect(() => {
    matchOpacity.value = withTiming(1, { duration: 600 });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sine) })
      ), -1, false
    );
    const t = setTimeout(() => {
      vsScale.value = withSpring(1, { damping: 10 });
      const t2 = setTimeout(() => startCountdown(), 2000);
      return () => clearTimeout(t2);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const startCountdown = () => {
    setPhase('countdown');
    let c = 3;
    const interval = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) { clearInterval(interval); startBattle(); }
    }, 1000);
  };

  const startBattle = () => {
    setPhase('battle');
    let t = BATTLE_DURATION;
    const timer = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      // Simulate opponent scoring
      if (Math.random() < 0.05) setOppScore((s) => s + 10);
      if (t <= 0) { clearInterval(timer); setPhase('result'); }
    }, 1000);
  };

  const handleAnswer = (correct) => {
    if (correct) {
      setMyScore((s) => s + 10);
    }
    setCurrentQ((q) => q + 1);
  };

  const matchStyle = useAnimatedStyle(() => ({ opacity: matchOpacity.value }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const vsStyle = useAnimatedStyle(() => ({ transform: [{ scale: vsScale.value }] }));

  const timeProgress = timeLeft / BATTLE_DURATION;
  const myProgress = Math.min(myScore / 100, 1);
  const oppProgress = Math.min(oppScore / 100, 1);

  // ── MATCHMAKING ──────────────────────────────────────────────────────────────
  if (phase === 'matchmaking') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0a0014', '#1a0033', '#07000F']} style={StyleSheet.absoluteFill} />
        <ParticleBackground count={20} />
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Animated.View style={[styles.matchCenter, matchStyle]}>
          <Text style={styles.matchTitle}>Battle Mode ⚔️</Text>
          <Text style={styles.matchSub}>Finding your opponent...</Text>
          <View style={styles.avatarsRow}>
            <Animated.View style={[styles.playerBox, pulseStyle]}>
              <LinearGradient colors={Gradients.primaryVibrant} style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>{(profile?.username || 'Y').charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <Text style={styles.playerName}>{profile?.username || 'You'}</Text>
              <Text style={styles.playerLevel}>Lvl {profile?.level || 1}</Text>
            </Animated.View>

            <Animated.View style={[styles.vsContainer, vsStyle]}>
              <LinearGradient colors={Gradients.battle} style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.playerBox, pulseStyle]}>
              <LinearGradient colors={Gradients.accent} style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>{MOCK_OPPONENT.avatar}</Text>
              </LinearGradient>
              <Text style={styles.playerName}>{MOCK_OPPONENT.username}</Text>
              <Text style={styles.playerLevel}>Lvl {MOCK_OPPONENT.level}</Text>
            </Animated.View>
          </View>
          <View style={styles.searchingRow}>
            <Ionicons name="search" size={16} color={Colors.primaryLight} />
            <Text style={styles.searchingText}>Searching global players...</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── COUNTDOWN ────────────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#0a0014', '#1a0033', '#07000F']} style={StyleSheet.absoluteFill} />
        <Text style={styles.countdownLabel}>Battle starts in</Text>
        <Text style={styles.countdownNum}>{countdown}</Text>
        <Text style={styles.countdownSub}>Get Ready! ⚡</Text>
      </View>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const won = myScore >= oppScore;
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#0a0014', '#1a0033', '#07000F']} style={StyleSheet.absoluteFill} />
        <Text style={{ fontSize: 72 }}>{won ? '🏆' : '💀'}</Text>
        <Text style={styles.resultTitle}>{won ? 'Victory!' : 'Defeated!'}</Text>
        <Card variant="glass" style={styles.resultCard}>
          <View style={styles.finalScoreRow}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.finalScoreLabel}>{profile?.username || 'You'}</Text>
              <Text style={[styles.finalScore, { color: Colors.primaryLight }]}>{myScore}</Text>
            </View>
            <Text style={styles.finalVs}>VS</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.finalScoreLabel}>{MOCK_OPPONENT.username}</Text>
              <Text style={[styles.finalScore, { color: Colors.accent }]}>{oppScore}</Text>
            </View>
          </View>
          {won && <Text style={styles.xpGain}>+{myScore} XP Earned ⚡</Text>}
        </Card>
        <AnimatedButton title="Play Again" onPress={() => { setPhase('matchmaking'); setMyScore(0); setOppScore(0); setTimeLeft(BATTLE_DURATION); setCurrentQ(0); }} variant="primary" size="lg" style={{ marginTop: Spacing.lg, width: 220 }} />
        <AnimatedButton title="Back to Home" onPress={() => navigation.navigate('Home')} variant="ghost" size="md" style={{ marginTop: Spacing.sm, width: 220 }} />
      </View>
    );
  }

  // ── BATTLE ───────────────────────────────────────────────────────────────────
  const MOCK_QUESTIONS = [
    { text: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Rome'], answer: 'Paris' },
    { text: 'What is 12 × 12?', options: ['124', '144', '148', '132'], answer: '144' },
    { text: 'Which planet is the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 'Mars' },
  ];
  const q = MOCK_QUESTIONS[currentQ % MOCK_QUESTIONS.length];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#1a0033', '#07000F']} style={StyleSheet.absoluteFill} />

      {/* Header scores */}
      <View style={styles.battleHeader}>
        <View style={styles.scoreBox}>
          <LinearGradient colors={Gradients.primary} style={styles.scoreAvatar}>
            <Text style={styles.scoreAvatarText}>{(profile?.username || 'Y').charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.scoreName}>{profile?.username || 'You'}</Text>
          <Text style={styles.scoreNum}>{myScore}</Text>
          <ProgressBar progress={myProgress} height={4} gradient={Gradients.primary} style={{ marginTop: 4 }} />
        </View>

        <View style={styles.timerCenter}>
          <View style={[styles.timerCircle, timeLeft <= 10 && styles.timerUrgent]}>
            <Text style={[styles.timerNum, timeLeft <= 10 && { color: Colors.red }]}>{timeLeft}</Text>
            <Text style={styles.timerSec}>sec</Text>
          </View>
        </View>

        <View style={styles.scoreBox}>
          <LinearGradient colors={Gradients.accent} style={styles.scoreAvatar}>
            <Text style={styles.scoreAvatarText}>{MOCK_OPPONENT.avatar}</Text>
          </LinearGradient>
          <Text style={styles.scoreName}>{MOCK_OPPONENT.username}</Text>
          <Text style={styles.scoreNum}>{oppScore}</Text>
          <ProgressBar progress={oppProgress} height={4} gradient={Gradients.accent} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Timer bar */}
      <ProgressBar progress={timeProgress} height={6} gradient={timeLeft <= 10 ? Gradients.danger : Gradients.battle} style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }} />

      <ScrollView contentContainerStyle={styles.battleScroll} showsVerticalScrollIndicator={false}>
        <Card variant="glass" glow style={styles.battleQCard}>
          <LinearGradient colors={['rgba(236,72,153,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={styles.battleQNum}>Q{currentQ + 1}</Text>
          <Text style={styles.battleQText}>{q.text}</Text>
        </Card>

        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={styles.battleOption}
            onPress={() => handleAnswer(opt === q.answer)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(124,58,237,0.15)', 'rgba(79,70,229,0.08)']}
              style={styles.battleOptionGrad}
            >
              <View style={styles.battleOptionLabel}>
                <Text style={styles.battleOptionLabelText}>{'ABCD'[i]}</Text>
              </View>
              <Text style={styles.battleOptionText}>{opt}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  closeBtn: { position: 'absolute', top: 50, right: Spacing.lg, zIndex: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgGlass, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  matchCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  matchTitle: { fontSize: 32, fontWeight: FontWeight.black, color: Colors.white, marginBottom: 8 },
  matchSub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xxl },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.lg },
  playerBox: { alignItems: 'center' },
  bigAvatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 16 },
  bigAvatarText: { fontSize: 40, fontWeight: FontWeight.black, color: Colors.white },
  playerName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  playerLevel: { fontSize: FontSize.sm, color: Colors.textMuted },
  vsContainer: {},
  vsBadge: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 16 },
  vsText: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.white },
  searchingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  searchingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  countdownLabel: { fontSize: FontSize.xl, color: Colors.textSecondary, marginBottom: Spacing.md },
  countdownNum: { fontSize: 120, fontWeight: FontWeight.black, color: Colors.primaryLight, lineHeight: 130 },
  countdownSub: { fontSize: FontSize.xl, color: Colors.textSecondary, marginTop: Spacing.md },
  battleHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  scoreBox: { flex: 1, alignItems: 'center' },
  scoreAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  scoreAvatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.white },
  scoreName: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, marginBottom: 2 },
  scoreNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.white },
  timerCenter: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  timerCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.bgGlass, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border },
  timerUrgent: { borderColor: Colors.red, shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 10 },
  timerNum: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.primaryLight },
  timerSec: { fontSize: FontSize.xs, color: Colors.textMuted },
  battleScroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  battleQCard: { marginBottom: Spacing.lg, overflow: 'hidden' },
  battleQNum: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent, letterSpacing: 1, marginBottom: Spacing.sm },
  battleQText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 28 },
  battleOption: { marginBottom: Spacing.sm, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
  battleOptionGrad: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  battleOptionLabel: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  battleOptionLabelText: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.primaryLight },
  battleOptionText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  resultTitle: { fontSize: 36, fontWeight: FontWeight.black, color: Colors.white, marginTop: Spacing.md, marginBottom: Spacing.xl },
  resultCard: { width: '90%', alignItems: 'center' },
  finalScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: Spacing.md },
  finalScoreLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 4 },
  finalScore: { fontSize: 44, fontWeight: FontWeight.black },
  finalVs: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.textMuted },
  xpGain: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.gold },
});

export default BattleScreen;
