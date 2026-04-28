import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, FontSize, FontWeight, Spacing, Gradients } from '../theme';

const AVATARS = [
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'dragon', emoji: '🐲', label: 'Dragon' },
  { id: 'phoenix', emoji: '🦅', label: 'Phoenix' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'ghost', emoji: '👻', label: 'Ghost' },
  { id: 'skull', emoji: '💀', label: 'Skull' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'lightning', emoji: '⚡', label: 'Lightning' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
  const renderItem = ({ item }) => {
    const isSelected = selectedAvatar === item.id;
    return (
      <TouchableOpacity
        onPress={() => onSelect(item.id)}
        style={[styles.avatarItem, isSelected && styles.avatarSelected]}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <LinearGradient
            colors={Gradients.primaryVibrant}
            style={styles.avatarInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarEmoji}>{item.emoji}</Text>
            <Text style={styles.avatarLabelSelected}>{item.label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.avatarInner}>
            <Text style={styles.avatarEmoji}>{item.emoji}</Text>
            <Text style={styles.avatarLabel}>{item.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Avatar</Text>
      <FlatList
        data={AVATARS}
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={renderItem}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  avatarItem: {
    flex: 1,
    maxWidth: '23%',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  avatarSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    backgroundColor: Colors.bgGlass,
  },
  avatarEmoji: { fontSize: 28, marginBottom: 2 },
  avatarLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  avatarLabelSelected: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});

export { AVATARS };
export default AvatarSelector;
