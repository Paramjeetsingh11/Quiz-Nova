import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Gradients, FontSize, FontWeight, Radius } from '../theme';

const Tab = createBottomTabNavigator();

const TabBar = ({ state, descriptors, navigation }) => (
  <View style={styles.tabBar}>
    <LinearGradient
      colors={['rgba(13,5,32,0.98)', 'rgba(7,0,15,0.99)']}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.tabRow}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconMap = {
          Home: isFocused ? 'home' : 'home-outline',
          Leaderboard: isFocused ? 'trophy' : 'trophy-outline',
          Analytics: isFocused ? 'stats-chart' : 'stats-chart-outline',
          Profile: isFocused ? 'person' : 'person-outline',
        };
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <View key={route.key} style={styles.tabItem}>
            <View
              onTouchEnd={onPress}
              style={styles.tabTouchable}
            >
              {isFocused && (
                <LinearGradient
                  colors={['rgba(124,58,237,0.25)', 'rgba(124,58,237,0.05)']}
                  style={styles.activeIndicator}
                />
              )}
              <Ionicons
                name={iconMap[route.name]}
                size={24}
                color={isFocused ? Colors.primaryLight : Colors.textMuted}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {route.name}
              </Text>
              {isFocused && <View style={styles.activeDot} />}
            </View>
          </View>
        );
      })}
    </View>
  </View>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 68,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.2)',
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1 },
  tabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: Radius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.lg,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: FontWeight.bold,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryLight,
  },
});

export default TabNavigator;
