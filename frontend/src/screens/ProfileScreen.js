import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';
import ProgressBar from '../components/ProgressBar';
import Card from '../components/Card';
import AvatarSelector, { AVATARS } from '../components/AvatarSelector';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';

const ProfileScreen = ({ navigation }) => {
  const { profile, fetchProfile, updateProfile, isLoading } = useUserStore();
  const { logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar: 'wizard' });

  const headerY = useSharedValue(-30);
  const headerOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerY.value = withSpring(0, { damping: 14 });
    cardOpacity.value = withTiming(1, { duration: 700 });
    cardScale.value = withSpring(1, { damping: 14 });
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || 'wizard',
      });
    }
  }, [profile]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const handleSave = async () => {
    if (!form.username.trim()) {
      Alert.alert('Required', 'Username cannot be empty.');
      return;
    }
    const result = await updateProfile(form);
    if (result.success) {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Update Failed', result.message || 'Something went wrong.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await logout(); navigation.replace('Login'); },
      },
    ]);
  };

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpProgress = Math.min((xp % 500) / 500, 1);
  const avatarEmoji = AVATARS.find((a) => a.id === (profile?.avatar || 'wizard'))?.emoji || '🧙‍♂️';

  const STATS = [
    { label: 'Quizzes', value: profile?.totalQuizzes || 0, icon: '📝' },
    { label: 'Accuracy', value: `${profile?.accuracy || 0}%`, icon: '🎯' },
    { label: 'Streak', value: `${profile?.streak || 0}🔥`, icon: '🔥' },
    { label: 'Rank', value: `#${profile?.rank || '–'}`, icon: '🏅' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editToggle} onPress={() => setEditing(!editing)}>
          <Ionicons name={editing ? 'close' : 'pencil'} size={20} color={Colors.primaryLight} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <Animated.View style={[styles.avatarSection, cardStyle]}>
          <LinearGradient colors={['rgba(124,58,237,0.3)', 'rgba(6,182,212,0.1)']} style={styles.avatarGlow}>
            <LinearGradient colors={Gradients.heroFull} style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
            </LinearGradient>
          </LinearGradient>
          <Text style={styles.profileName}>{profile?.username || 'Champion'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
          <View style={styles.levelBadge}>
            <LinearGradient colors={Gradients.primary} style={styles.levelBadgeGrad}>
              <Text style={styles.levelBadgeText}>Level {level}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* XP Bar */}
        <Card variant="glass" style={styles.xpCard}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>⚡ {xp.toLocaleString()} XP</Text>
            <Text style={styles.xpNextLabel}>{(level * 500).toLocaleString()} XP</Text>
          </View>
          <ProgressBar progress={xpProgress} height={10} gradient={Gradients.heroFull} style={{ marginTop: 8 }} />
          <Text style={styles.xpSub}>{Math.round(xpProgress * 100)}% to Level {level + 1}</Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <Card key={i} variant="glass" style={styles.statCard} padding={Spacing.md}>
              <Text style={{ fontSize: 22 }}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Edit Form */}
        {editing ? (
          <Card variant="glass" style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Profile</Text>
            <Text style={styles.editLabel}>Username</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={form.username}
                onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
                placeholder="Your username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.editLabel}>Bio</Text>
            <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 10 }]}>
              <TextInput
                style={[styles.input, { height: 70 }]}
                value={form.bio}
                onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
                placeholder="Tell the world about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
            <AvatarSelector selectedAvatar={form.avatar} onSelect={(id) => setForm((f) => ({ ...f, avatar: id }))} />
            <AnimatedButton title="Save Changes" onPress={handleSave} loading={isLoading} variant="primary" size="lg" style={{ marginTop: Spacing.md }} />
            <AnimatedButton title="Cancel" onPress={() => setEditing(false)} variant="ghost" size="md" style={{ marginTop: Spacing.sm }} />
          </Card>
        ) : (
          <Card variant="glass" style={styles.bioCard}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{profile?.bio || 'No bio yet. Tap ✏️ to add one!'}</Text>
            <View style={styles.adminRow}>
              {profile?.isAdmin && (
                <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('Admin')}>
                  <Ionicons name="shield" size={16} color={Colors.gold} />
                  <Text style={styles.adminBtnText}>Admin Panel</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        <AnimatedButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="md"
          style={{ marginTop: Spacing.lg }}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgGlass, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.white },
  editToggle: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarGlow: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 24, elevation: 16 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 52 },
  profileName: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.white, marginBottom: 4 },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  levelBadge: { borderRadius: Radius.full, overflow: 'hidden' },
  levelBadgeGrad: { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  levelBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.white },
  xpCard: { marginBottom: Spacing.lg },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryLight },
  xpNextLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  xpSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.white },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  editCard: { marginBottom: Spacing.lg },
  editTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: Spacing.md },
  editLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8, marginTop: Spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.borderLight, paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? 14 : 10 },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  bioCard: { marginBottom: Spacing.lg },
  bioTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8 },
  bioText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22 },
  adminRow: { marginTop: Spacing.md },
  adminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  adminBtnText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.bold },
});

export default ProfileScreen;
