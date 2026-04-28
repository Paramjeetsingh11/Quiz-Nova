import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withSequence, Easing, runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import ProgressBar from '../components/ProgressBar';
import QuizOption from '../components/QuizOption';
import AnimatedButton from '../components/AnimatedButton';
import Card from '../components/Card';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useQuiz from '../hooks/useQuiz';

const { width: W } = Dimensions.get('window');
const LABELS = ['A', 'B', 'C', 'D'];

const QuizScreen = ({ navigation, route }) => {
  const topic = route?.params?.topic || 'general';
  const confettiRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const {
    questions, currentIndex, currentQuestion, selectedAnswers,
    progress, timerProgress, timeLeft, fetchQuiz, handleSelectAnswer,
    handleNext, submitQuiz, resetQuiz, isLoading, isSubmitting, result,
  } = useQuiz(30);

  const cardX = useSharedValue(W);
  const cardOpacity = useSharedValue(0);
  const timerColor = useSharedValue(0);

  useEffect(() => {
    fetchQuiz(topic);
    return () => resetQuiz();
  }, [topic]);

  // Animate card slide on question change
  useEffect(() => {
    if (!currentQuestion) return;
    setRevealed(false);
    cardX.value = W * 0.5;
    cardOpacity.value = 0;
    cardX.value = withSpring(0, { damping: 18, stiffness: 200 });
    cardOpacity.value = withTiming(1, { duration: 400 });
  }, [currentIndex, currentQuestion?.id]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardX.value }],
  }));

  const handleAnswer = (option) => {
    if (revealed) return;
    handleSelectAnswer(option);
    setRevealed(true);
    const isCorrect = option === currentQuestion?.correctAnswer || option === currentQuestion?.answer;
    if (isCorrect) {
      confettiRef.current?.start();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      handleSubmit();
    } else {
      handleNext();
      setRevealed(false);
    }
  };

  const handleSubmit = async () => {
    setIsFinished(true);
    await submitQuiz();
  };

  const getOptionState = (option) => {
    if (!revealed) return {};
    const correct = currentQuestion?.correctAnswer || currentQuestion?.answer;
    const selected = selectedAnswers[currentIndex];
    if (option === correct) return { isCorrect: true };
    if (option === selected && option !== correct) return { isWrong: true };
    return {};
  };

  // Timer color animation
  const timerStyle = useAnimatedStyle(() => {
    const isUrgent = timerProgress < 0.3;
    return {
      shadowColor: isUrgent ? Colors.red : Colors.primary,
      shadowOpacity: isUrgent ? 0.8 : 0.4,
    };
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#0a0014', '#07000F']} style={StyleSheet.absoluteFill} />
        <Text style={styles.loadingEmoji}>⚡</Text>
        <Text style={styles.loadingText}>Loading Quiz...</Text>
        <ProgressBar progress={0.6} style={{ width: 200, marginTop: Spacing.lg }} />
      </View>
    );
  }

  if (!currentQuestion && !isLoading) {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#0a0014', '#07000F']} style={StyleSheet.absoluteFill} />
        <Text style={styles.loadingEmoji}>😕</Text>
        <Text style={styles.loadingText}>No questions found for "{topic}"</Text>
        <AnimatedButton title="Go Back" onPress={() => navigation.goBack()} variant="primary" size="md" style={{ marginTop: Spacing.lg, width: 160 }} />
      </View>
    );
  }

  if (isFinished && result) {
    const scorePercent = Math.round((result.score / (result.total || questions.length)) * 100);
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#0a0014', '#12003a', '#07000F']} style={StyleSheet.absoluteFill} />
        {scorePercent >= 70 && <ConfettiCannon count={120} origin={{ x: W / 2, y: 0 }} fadeOut autoStart />}
        <Text style={styles.resultEmoji}>{scorePercent >= 70 ? '🏆' : scorePercent >= 40 ? '🎯' : '💪'}</Text>
        <Text style={styles.resultTitle}>{scorePercent >= 70 ? 'Excellent!' : scorePercent >= 40 ? 'Good Job!' : 'Keep Practicing!'}</Text>
        <Card style={styles.resultCard} variant="glass">
          <Text style={styles.resultScore}>{result.score ?? 0} / {result.total ?? questions.length}</Text>
          <Text style={styles.resultPercent}>{scorePercent}% Accuracy</Text>
          {result.xpEarned && <Text style={styles.xpEarned}>+{result.xpEarned} XP Earned ⚡</Text>}
        </Card>
        <AnimatedButton title="Play Again" onPress={() => { resetQuiz(); fetchQuiz(topic); setIsFinished(false); }} variant="primary" size="lg" style={{ marginTop: Spacing.lg, width: 220 }} />
        <AnimatedButton title="Back to Home" onPress={() => navigation.navigate('Home')} variant="ghost" size="md" style={{ marginTop: Spacing.sm, width: 220 }} />
      </View>
    );
  }

  const options = currentQuestion?.options || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />
      <ConfettiCannon ref={confettiRef} count={60} origin={{ x: W / 2, y: 0 }} autoStart={false} fadeOut />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.topicText}>{topic.toUpperCase()}</Text>
          <Text style={styles.questionCounter}>{currentIndex + 1} / {questions.length}</Text>
        </View>
        <Animated.View style={[styles.timerBadge, timerStyle]}>
          <Text style={[styles.timerText, timerProgress < 0.3 && { color: Colors.red }]}>{timeLeft}s</Text>
        </Animated.View>
      </View>

      {/* Progress bars */}
      <View style={styles.progressArea}>
        <ProgressBar progress={progress} height={6} gradient={Gradients.primaryVibrant} style={{ marginBottom: 8 }} />
        <ProgressBar
          progress={timerProgress}
          height={4}
          gradient={timerProgress < 0.3 ? Gradients.danger : Gradients.secondary}
          backgroundColor="transparent"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Animated.View style={[styles.questionCard, cardStyle]}>
          <Card variant="glass" glow style={styles.questionCardInner}>
            <LinearGradient colors={['rgba(124,58,237,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
            <View style={styles.qNumBadge}>
              <Text style={styles.qNumText}>Q{currentIndex + 1}</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion?.question || currentQuestion?.text}</Text>
          </Card>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((opt, i) => {
            const optText = typeof opt === 'string' ? opt : opt.text || opt.value;
            const optValue = typeof opt === 'string' ? opt : opt.value || opt.text;
            const { isCorrect, isWrong } = getOptionState(optValue);
            const isSelected = selectedAnswers[currentIndex] === optValue;
            return (
              <QuizOption
                key={i}
                label={LABELS[i]}
                text={optText}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isWrong={isWrong}
                onPress={() => handleAnswer(optValue)}
                disabled={revealed}
              />
            );
          })}
        </View>

        {/* Next Button */}
        {revealed && (
          <Animated.View entering={withSpring}>
            <AnimatedButton
              title={currentIndex >= questions.length - 1 ? 'Finish Quiz 🏁' : 'Next Question →'}
              onPress={handleNextQuestion}
              loading={isSubmitting}
              variant={currentIndex >= questions.length - 1 ? 'accent' : 'primary'}
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingEmoji: { fontSize: 48, marginBottom: Spacing.md },
  loadingText: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgGlass, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  headerCenter: { flex: 1, alignItems: 'center' },
  topicText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 2 },
  questionCounter: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.white },
  timerBadge: { width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.bgGlass, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 8 },
  timerText: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.primaryLight },
  progressArea: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  questionCard: { marginBottom: Spacing.lg },
  questionCardInner: { overflow: 'hidden' },
  qNumBadge: { backgroundColor: 'rgba(124,58,237,0.3)', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: Spacing.md },
  qNumText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primaryLight, letterSpacing: 1 },
  questionText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 30 },
  optionsContainer: { gap: 0 },
  resultEmoji: { fontSize: 72, marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.white, marginBottom: Spacing.lg },
  resultCard: { width: '85%', alignItems: 'center' },
  resultScore: { fontSize: 52, fontWeight: FontWeight.black, color: Colors.primaryLight, marginBottom: 4 },
  resultPercent: { fontSize: FontSize.lg, color: Colors.textSecondary, marginBottom: Spacing.sm },
  xpEarned: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.gold },
});

export default QuizScreen;
