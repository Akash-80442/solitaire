import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface ScoreDashboardProps {
  score: number;
  time: number;
  moves: number;
  mode?: string;
}

const formatTime = (time: number) => {
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = (time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ score, time, moves, mode }) => {
  return (
    <View style={styles.dashboard}>
      <View style={styles.dashScoreBox}>
        <Text style={styles.dashScoreLabel}>SCORE</Text>
        <Text style={styles.dashScoreValue}>{score}</Text>
      </View>

      <View style={styles.dashDividerVertical} />

      <View style={styles.dashStatsBox}>
        <Text style={styles.dashStatText}>
          <Icon name="clock" size={12} color="#9CA3AF" />  {formatTime(time)}
        </Text>
        <Text style={styles.dashStatText}>
          <Icon name="shoe-prints" size={12} color="#9CA3AF" />  {moves} Moves
        </Text>
      </View>

      {mode && (
        <>
          <View style={styles.dashDividerVertical} />
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{mode}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  dashScoreBox: { flex: 1.2, alignItems: 'center' },
  dashScoreLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  dashScoreValue: {
    color: '#38BDF8',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dashDividerVertical: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 12 },
  dashStatsBox: { flex: 1.5, justifyContent: 'center', gap: 4 },
  dashStatText: { color: '#E5E7EB', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  modeBadge: { flex: 0.8, backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeBadgeText: { color: '#D1D5DB', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
});
