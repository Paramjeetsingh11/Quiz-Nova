import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import LeaderboardItem from '../components/LeaderboardItem';
import Card from '../components/Card';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import { leaderboardAPI } from '../services/api';
import useUserStore from '../store/userStore';

const FILTERS = ['Global', 'Weekly', 'Friends'];

const LeaderboardScreen = ({ navigation }) => {
  const { profile } = useUserStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Global');
  const [error, setError] = useState(null);

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerY.value = withTiming(0, { duration: 600 });
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaderboardAPI.getLeaderboard();
      setData(res.data?.leaderboard || res.data || []);
    } catch (e) {
      setError('Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const myRank = data.findIndex((u) => u.id === profile?.id || u.username === profile?.username) + 1;

  const renderItem = ({ item, index }) => (
    <Animated.View style={{ opacity: withDelay(index * 40, withTiming(1, { duration: 400 })) }}>
      <LeaderboardItem
        item={item}
        rank={index + 1}
        isCurrentUser={item.username === profile?.username || item.id === profile?.id}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSub}>Top players worldwide</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Trophy Banner */}
      <LinearGradient colors={['rgba(245,158,11,0.2)', 'rgba(124,58,237,0.1)']} style={styles.trophyBanner}>
        <Text style={{ fontSize: 36 }}>🏆</Text>
        <View style={{ marginLeft: Spacing.md }}>
          <Text style={styles.trophyTitle}>Global Rankings</Text>
          {myRank > 0 && <Text style={styles.myRankText}>Your Rank: #{myRank}</Text>}
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>{data.length} players</Text>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <View style={styles.podium}>
          {[1, 0, 2].map((i) => {
            const item = data[i];
            const heights = [90, 110, 70];
            const colors = [Gradients.secondary, Gradients.gold, Gradients.primary];
            const pos = [1, 0, 2];
            return (
              <View key={i} style={styles.podiumSlot}>
                <LinearGradient colors={colors[pos[i]]} style={[styles.podiumAvatar, { width: i === 0 ? 56 : 48, height: i === 0 ? 56 : 48, borderRadius: i === 0 ? 28 : 24 }]}>
                  <Text style={styles.podiumAvatarText}>{(item?.username || 'U').charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <Text style={styles.podiumName} numberOfLines={1}>{item?.username}</Text>
                <Text style={styles.podiumXP}>{(item?.xp || 0).toLocaleString()}</Text>
                <View style={[styles.podiumBar, { height: heights[pos[i]], backgroundColor: colors[pos[i]][0] + '40' }]}>
                  <Text style={styles.podiumRank}>{['🥇', '🥈', '🥉'][pos[i]]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* List */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data.slice(3)}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={({ item, index }) => (
            <LeaderboardItem
              item={item}
              rank={index + 4}
              isCurrentUser={item.username === profile?.username || item.id === profile?.id}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 48 }}>🏅</Text>
                <Text style={styles.emptyText}>No leaderboard data yet.</Text>
              </View>
            )
          }
        />
      )}
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
  trophyBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  trophyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  myRankText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold },
  totalBadge: { backgroundColor: Colors.bgGlass, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  totalText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  filterRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgGlass, borderRadius: Radius.lg, padding: 4, borderWidth: 1, borderColor: Colors.borderLight },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.md },
  filterBtnActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 8 },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  filterTextActive: { color: Colors.white },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.sm },
  podiumSlot: { flex: 1, alignItems: 'center' },
  podiumAvatar: { alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  podiumAvatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.white },
  podiumName: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: 2, maxWidth: 80, textAlign: 'center' },
  podiumXP: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 },
  podiumRank: { fontSize: 20 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textSecondary, fontSize: FontSize.md, marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  retryText: { color: Colors.white, fontWeight: FontWeight.bold },
  emptyBox: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.md },
});

export default LeaderboardScreen;
