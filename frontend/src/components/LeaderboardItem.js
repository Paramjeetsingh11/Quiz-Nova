import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, FontSize, FontWeight, Spacing, Gradients, Shadows } from '../theme';

const MEDAL_COLORS = {
  1: { gradient: ['#FFD700', '#F59E0B'], glow: '#FFD700', emoji: '🥇' },
  2: { gradient: ['#C0C0C0', '#9CA3AF'], glow: '#C0C0C0', emoji: '🥈' },
  3: { gradient: ['#CD7F32', '#D97706'], glow: '#CD7F32', emoji: '🥉' },
};

const LeaderboardItem = ({ item, rank, isCurrentUser = false }) => {
  const medal = MEDAL_COLORS[rank];

  return (
    <View
      style={[
        styles.container,
        isCurrentUser && styles.currentUser,
        rank <= 3 && { borderColor: medal.glow + '55', shadowColor: medal.glow },
      ]}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <LinearGradient
            colors={medal.gradient}
            style={styles.medalBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.rankTopText}>{rank}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </View>

      {/* Avatar */}
      <LinearGradient
        colors={isCurrentUser ? Gradients.primaryVibrant : ['rgba(124,58,237,0.3)', 'rgba(79,70,229,0.3)']}
        style={styles.avatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.avatarText}>
          {(item?.username || item?.name || 'U').charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && styles.nameHighlight]}>
          {item?.username || item?.name || 'Unknown'}
          {isCurrentUser && '  (You)'}
        </Text>
        <Text style={styles.level}>Level {item?.level || 1}</Text>
      </View>

      {/* XP Score */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, rank <= 3 && { color: medal.glow }]}>
          {(item?.xp || item?.score || 0).toLocaleString()}
        </Text>
        <Text style={styles.scoreLabel}>XP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgGlass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  currentUser: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: Colors.primary,
    ...Shadows.glow,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  medalBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glowGold,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgGlassStrong,
  },
  rankTopText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.bg,
  },
  rankText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.white,
  },
  info: { flex: 1 },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameHighlight: { color: Colors.primaryLight },
  level: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  scoreContainer: { alignItems: 'flex-end' },
  score: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.primaryLight,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});

export default LeaderboardItem;
