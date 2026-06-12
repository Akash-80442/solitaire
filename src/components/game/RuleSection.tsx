import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Suit } from '../../types';

export const RuleSection: React.FC<{ number?: string; icon?: React.ReactNode; title: string; children: React.ReactNode }> = ({ number, icon, title, children }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      {number && (
        <View style={styles.numBadge}>
          <Text style={styles.num}>{number}</Text>
        </View>
      )}
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
    </View>
    {children}
  </View>
);

export const MiniCard: React.FC<{ suit: Suit; rank: number }> = ({ suit, rank }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const rankLabel = rank === 1 ? 'A' : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : String(rank);
  const map: Record<Suit, string> = { hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣' };
  const symbol = map[suit] ?? '';

  return (
    <View style={miniStyles.card}>
      <Text style={[miniStyles.corner, { color: isRed ? '#EF4444' : '#1F2937' }]}>{rankLabel}</Text>
      <Text style={[miniStyles.center, { color: isRed ? '#EF4444' : '#1F2937' }]}>{symbol}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  numBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  num: { color: '#F8FAFC', fontSize: 12, fontWeight: '900' },
  title: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});

const miniStyles = StyleSheet.create({
  card: { width: 36, height: 50, borderRadius: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginHorizontal: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  corner: { position: 'absolute', top: 3, left: 4, fontSize: 10, fontWeight: '900' },
  center: { fontSize: 16, fontWeight: '700' },
});
