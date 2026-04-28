import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';
import ParticleBackground from '../components/ParticleBackground';
import AvatarSelector from '../components/AvatarSelector';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useAuth from '../hooks/useAuth';

const SignupScreen = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [avatar, setAvatar] = useState('wizard');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1); // 1: details, 2: avatar

  const cardY = useSharedValue(60);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    cardY.value = withDelay(100, withSpring(0, { damping: 16 }));
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    const result = await register({ ...form, avatar });
    if (result.success) navigation.replace('MainTabs');
  };

  const Field = ({ label, field, placeholder, secure, keyboard, icon }) => {
    const focused = focusedField === field;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrap, focused && styles.inputFocused]}>
          <Ionicons name={icon} size={18} color={focused ? Colors.primaryLight : Colors.textMuted} style={styles.icon} />
          <TextInput
            style={styles.input}
            value={form[field]}
            onChangeText={(v) => update(field, v)}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={secure && !showPassword}
            keyboardType={keyboard || 'default'}
            autoCapitalize="none"
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
          />
          {secure && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#12003a', '#07000F']} style={StyleSheet.absoluteFill} />
      <ParticleBackground count={12} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          <Text style={styles.backText}>{step === 2 ? 'Back' : 'Login'}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={Gradients.heroFull} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.logoEmoji}>🚀</Text>
          </LinearGradient>
          <Text style={styles.title}>{step === 1 ? 'Create Account' : 'Pick Your Avatar'}</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Step 1 of 2 — Your Details' : 'Step 2 of 2 — Choose Your Champion'}
          </Text>
          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
        </View>

        <Animated.View style={[styles.card, cardStyle]}>
          {step === 1 ? (
            <>
              <Field label="Username" field="username" placeholder="YourGamertag" icon="person-outline" />
              <Field label="Email" field="email" placeholder="you@example.com" keyboard="email-address" icon="mail-outline" />
              <Field label="Password" field="password" placeholder="Min 6 characters" secure icon="lock-closed-outline" />
              <Field label="Confirm Password" field="confirmPassword" placeholder="Repeat password" secure icon="shield-checkmark-outline" />
              <AnimatedButton title="Next →" onPress={handleNext} variant="primary" size="lg" style={{ marginTop: Spacing.md }} />
            </>
          ) : (
            <>
              <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
              <AnimatedButton
                title="Create My Account"
                onPress={handleRegister}
                loading={isLoading}
                variant="primary"
                size="lg"
                style={{ marginTop: Spacing.md }}
              />
            </>
          )}

          <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: 6 },
  backText: { fontSize: FontSize.md, color: Colors.textSecondary },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 14, marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: 28, fontWeight: FontWeight.black, color: Colors.white, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.textMuted },
  stepDotActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.8, shadowRadius: 6, elevation: 6 },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.textMuted, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary },
  card: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.xxl, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.xl,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputFocused: { borderColor: Colors.primary, backgroundColor: 'rgba(124,58,237,0.08)' },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  loginText: { fontSize: FontSize.md, color: Colors.textSecondary },
  loginLink: { fontSize: FontSize.md, color: Colors.primaryLight, fontWeight: FontWeight.bold },
});

export default SignupScreen;
