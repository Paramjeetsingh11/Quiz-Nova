import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Colors, Gradients, FontSize, FontWeight, Spacing, Radius } from '../theme';
import { adminAPI } from '../services/api';

const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const opacity = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter((u) =>
      (u.username || u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    ));
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminAPI.getUsers();
      const list = res.data?.users || res.data || [];
      setUsers(list); setFiltered(list);
    } catch {
      setError('Failed to load users. Check admin permissions.');
    } finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchUsers(); setRefreshing(false); };

  const STATS = [
    { label: 'Total Users', value: users.length, icon: '👥', color: Colors.primaryLight },
    { label: 'Active Today', value: users.filter((u) => u.isActive).length, icon: '🟢', color: Colors.green },
    { label: 'Admins', value: users.filter((u) => u.isAdmin).length, icon: '🛡️', color: Colors.gold },
    { label: 'Banned', value: users.filter((u) => u.isBanned).length, icon: '🚫', color: Colors.red },
  ];

  const renderUser = ({ item, index }) => (
    <Card variant="glass" style={styles.userCard} padding={Spacing.md}>
      <View style={styles.userRow}>
        <LinearGradient
          colors={item.isAdmin ? Gradients.gold : item.isBanned ? Gradients.danger : Gradients.primary}
          style={styles.userAvatar}
        >
          <Text style={styles.userAvatarText}>{(item.username || item.name || 'U').charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{item.username || item.name || 'Unknown'}</Text>
            {item.isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMIN</Text></View>}
            {item.isBanned && <View style={styles.bannedBadge}><Text style={styles.bannedBadgeText}>BANNED</Text></View>}
          </View>
          <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userMetaText}>Lvl {item.level || 1}</Text>
            <View style={styles.dot} />
            <Text style={styles.userMetaText}>{(item.xp || 0).toLocaleString()} XP</Text>
            <View style={styles.dot} />
            <Text style={[styles.userMetaText, { color: item.isActive ? Colors.green : Colors.textMuted }]}>
              {item.isActive ? 'Active' : 'Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0014', '#0d0020', '#07000F']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>User Management</Text>
        </View>
        <LinearGradient colors={Gradients.gold} style={styles.adminIcon}>
          <Ionicons name="shield" size={20} color={Colors.bg} />
        </LinearGradient>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {STATS.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <LinearGradient colors={[s.color + '25', s.color + '08']} style={styles.statGrad}>
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={{ fontSize: 40 }}>🚫</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchUsers} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {filtered.length} {filtered.length === 1 ? 'User' : 'Users'} Found
            </Text>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 48 }}>👤</Text>
                <Text style={styles.emptyText}>No users found.</Text>
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
  adminIcon: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight },
  statGrad: { padding: Spacing.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  statLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium, textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgGlass, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  listHeader: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  userCard: { marginBottom: Spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  userAvatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.white },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  adminBadge: { backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.gold },
  adminBadgeText: { fontSize: 9, color: Colors.gold, fontWeight: FontWeight.black, letterSpacing: 0.5 },
  bannedBadge: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.red },
  bannedBadgeText: { fontSize: 9, color: Colors.red, fontWeight: FontWeight.black, letterSpacing: 0.5 },
  userEmail: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 4 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userMetaText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  moreBtn: { padding: Spacing.sm },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  retryText: { color: Colors.white, fontWeight: FontWeight.bold },
  emptyBox: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});

export default AdminScreen;
