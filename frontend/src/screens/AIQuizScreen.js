import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  SafeAreaView, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import AnimatedButton from '../components/AnimatedButton';
import QuizOption from '../components/QuizOption';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import ParticleBackground from '../components/ParticleBackground';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useQuizStore from '../store/quizStore';

const { width: W } = Dimensions.get('window');
const LABELS = ['A', 'B', 'C', 'D'];
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', emoji: '🟢', color: Colors.green },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: Colors.gold },
  { id: 'hard', label: 'Hard', emoji: '🔴', color: Colors.red },
];
const SUGGESTED = ['JavaScript', 'Space', 'World History', 'Biology', 'Python', 'Marvel', 'Cricket'];

const AIQuizScreen = ({ navigation }) => {
  const { generateAIQuiz, aiQuestions, isAILoading, resetQuiz } = useQuizStore();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState('input');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const confettiRef = useRef(null);

  const handleGenerate = async () => {
    if (!topic.trim()) { Alert.alert('Topic Required', 'Enter a topic to generate a quiz.'); return; }
    const result = await generateAIQuiz(topic.trim(), difficulty, count);
    if (result.success) { setPhase('quiz'); setCurrentIndex(0); setAnswers({}); setRevealed(false); }
    else Alert.alert('Generation Failed', result.message);
  };

  const handleAnswer = (option) => {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setRevealed(true);
    const q = aiQuestions[currentIndex];
    if (option === (q?.correctAnswer || q?.answer)) confettiRef.current?.start();
  };

  const handleNext = () => {
    if (currentIndex >= aiQuestions.length - 1) setPhase('result');
    else { setCurrentIndex((i) => i + 1); setRevealed(false); }
  };

  const getScore = () => aiQuestions.reduce((acc, q, i) => {
    return answers[i] === (q?.correctAnswer || q?.answer) ? acc + 1 : acc;
  }, 0);

  if (phase === 'input') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0a0014', '#0d0025', '#07000F']} style={StyleSheet.absoluteFill} />
        <ParticleBackground count={14} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerArea}>
            <LinearGradient colors={Gradients.secondary} style={styles.aiIcon}>
              <Text style={{ fontSize: 36 }}>🤖</Text>
            </LinearGradient>
            <Text style={styles.title}>AI Quiz Generator</Text>
            <Text style={styles.subtitle}>Powered by OpenAI • Any topic, instantly</Text>
          </View>
          <Card variant="glass" style={styles.card}>
            <Text style={styles.inputLabel}>Quiz Topic</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="sparkles" size={18} color={Colors.secondary} style={{ marginRight: 8 }} />
              <TextInput style={styles.input} value={topic} onChangeText={setTopic}
                placeholder="e.g. Quantum Physics, Marvel..." placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
            </View>
            <Text style={styles.suggestLabel}>Suggested Topics</Text>
            <View style={styles.suggestRow}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestChip} onPress={() => setTopic(s)}>
                  <Text style={styles.suggestText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity key={d.id}
                  style={[styles.diffBtn, difficulty === d.id && { borderColor: d.color, backgroundColor: d.color + '20' }]}
                  onPress={() => setDifficulty(d.id)}>
                  <Text style={{ fontSize: 18 }}>{d.emoji}</Text>
                  <Text style={[styles.diffLabel, difficulty === d.id && { color: d.color }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Questions: <Text style={{ color: Colors.secondaryLight }}>{count}</Text></Text>
            <View style={styles.countRow}>
              {[5, 10, 15, 20].map((n) => (
                <TouchableOpacity key={n} style={[styles.countBtn, count === n && styles.countBtnActive]} onPress={() => setCount(n)}>
                  <Text style={[styles.countText, count === n && styles.countTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AnimatedButton title={isAILoading ? 'Generating...' : '⚡ Generate AI Quiz'}
              onPress={handleGenerate} loading={isAILoading} variant="secondary" size="lg" style={{ marginTop: Spacing.lg }} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (phase === 'quiz') {
    const q = aiQuestions[currentIndex];
    const options = q?.options || [];
    const correct = q?.correctAnswer || q?.answer;
    const progress = (currentIndex + 1) / aiQuestions.length;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0a0014', '#0d0025', '#07000F']} style={StyleSheet.absoluteFill} />
        <ConfettiCannon ref={confettiRef} count={60} origin={{ x: W / 2, y: 0 }} autoStart={false} fadeOut />
        <View style={styles.qHeader}>
          <TouchableOpacity onPress={() => setPhase('input')}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.qTopicBadge}>🤖 AI • {topic}</Text>
            <Text style={styles.qCounter}>{currentIndex + 1} / {aiQuestions.length}</Text>
          </View>
          <View style={styles.diffPill}><Text style={{ fontSize: 12, color: Colors.textMuted, fontWeight: FontWeight.bold }}>{difficulty.toUpperCase()}</Text></View>
        </View>
        <ProgressBar progress={progress} height={6} gradient={Gradients.secondary} style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }} />
        <ScrollView contentContainerStyle={styles.qScroll} showsVerticalScrollIndicator={false}>
          <Card variant="glass" glow style={styles.qCard}>
            <LinearGradient colors={['rgba(6,182,212,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
            <View style={styles.qBadge}><Text style={styles.qBadgeText}>Q{currentIndex + 1}</Text></View>
            <Text style={styles.qText}>{q?.question || q?.text}</Text>
          </Card>
          {options.map((opt, i) => {
            const val = typeof opt === 'string' ? opt : opt.value || opt.text;
            const txt = typeof opt === 'string' ? opt : opt.text || opt.value;
            return (
              <QuizOption key={i} label={LABELS[i]} text={txt}
                isSelected={answers[currentIndex] === val}
                isCorrect={revealed && val === correct}
                isWrong={revealed && answers[currentIndex] === val && val !== correct}
                onPress={() => handleAnswer(val)} disabled={revealed} />
            );
          })}
          {revealed && (
            <AnimatedButton title={currentIndex >= aiQuestions.length - 1 ? 'See Results 🏁' : 'Next →'}
              onPress={handleNext} variant="secondary" size="lg" style={{ marginTop: Spacing.md }} />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const score = getScore();
  const pct = Math.round((score / aiQuestions.length) * 100);
  return (
    <View style={styles.center}>
      <LinearGradient colors={['#0a0014', '#12003a', '#07000F']} style={StyleSheet.absoluteFill} />
      {pct >= 70 && <ConfettiCannon count={120} origin={{ x: W / 2, y: 0 }} fadeOut autoStart />}
      <Text style={{ fontSize: 72 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '🎯' : '💪'}</Text>
      <Text style={styles.resultTitle}>{pct >= 70 ? 'Brilliant!' : pct >= 40 ? 'Good Job!' : 'Keep Going!'}</Text>
      <Card variant="glass" style={styles.resultCard}>
        <Text style={styles.resultTopic}>🤖 AI Quiz — {topic}</Text>
        <Text style={styles.resultScore}>{score} / {aiQuestions.length}</Text>
        <Text style={styles.resultPct}>{pct}% Score</Text>
      </Card>
      <AnimatedButton title="Try Another Topic" onPress={() => { resetQuiz(); setPhase('input'); setTopic(''); }} variant="secondary" size="lg" style={{ marginTop: Spacing.lg, width: 240 }} />
      <AnimatedButton title="Back to Home" onPress={() => navigation.navigate('Home')} variant="ghost" size="md" style={{ marginTop: Spacing.sm, width: 240 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, paddingTop: Spacing.lg },
  backBtn: { marginBottom: Spacing.lg },
  headerArea: { alignItems: 'center', marginBottom: Spacing.xl },
  aiIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 14 },
  title: { fontSize: 28, fontWeight: FontWeight.black, color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  card: {},
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8, marginTop: Spacing.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.borderLight, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  suggestLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm, marginBottom: 8, fontWeight: FontWeight.medium },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  suggestChip: { backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  suggestText: { fontSize: FontSize.sm, color: Colors.secondaryLight, fontWeight: FontWeight.medium },
  diffRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  diffBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.bgGlass },
  diffLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textMuted },
  countRow: { flexDirection: 'row', gap: Spacing.sm },
  countBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.borderLight, alignItems: 'center', backgroundColor: Colors.bgGlass },
  countBtnActive: { borderColor: Colors.secondary, backgroundColor: 'rgba(6,182,212,0.15)' },
  countText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textMuted },
  countTextActive: { color: Colors.secondaryLight },
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  qTopicBadge: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.bold },
  qCounter: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.white },
  diffPill: { backgroundColor: Colors.bgGlass, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: Colors.borderLight },
  qScroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  qCard: { marginBottom: Spacing.lg, overflow: 'hidden' },
  qBadge: { backgroundColor: 'rgba(6,182,212,0.2)', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: Spacing.md },
  qBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.secondaryLight, letterSpacing: 1 },
  qText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 30 },
  resultTitle: { fontSize: 32, fontWeight: FontWeight.black, color: Colors.white, marginTop: Spacing.md, marginBottom: Spacing.xl },
  resultCard: { width: '85%', alignItems: 'center' },
  resultTopic: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  resultScore: { fontSize: 52, fontWeight: FontWeight.black, color: Colors.secondaryLight, marginBottom: 4 },
  resultPct: { fontSize: FontSize.lg, color: Colors.textSecondary },
});

export default AIQuizScreen;
