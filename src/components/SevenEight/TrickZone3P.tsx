import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardView } from '../CardView';
import { Card } from '../../types';

interface TrickZone3PProps {
  playedCards: Record<string, Card | null>;
  players: string[];
  myPlayerName: string;
}

export const TrickZone3P: React.FC<TrickZone3PProps> = ({ playedCards, players, myPlayerName }) => {
  const getOpponents = () => {
    return players.filter(p => p !== myPlayerName);
  };

  const opponents = getOpponents();
  const leftOpponent = opponents[0];
  const rightOpponent = opponents[1];

  const myCard = playedCards[myPlayerName];
  const leftCard = leftOpponent ? playedCards[leftOpponent] : null;
  const rightCard = rightOpponent ? playedCards[rightOpponent] : null;

  return (
    <View style={styles.trickZone}>
      {/* Table Ring */}
      <View style={styles.tableRing} />

      {/* Top Left Opponent */}
      <View style={[styles.cardSlot, styles.slotLeft]}>
        {leftCard ? (
          <CardView card={leftCard} />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotLabel}>{leftOpponent ? leftOpponent.substring(0, 3).toUpperCase() : ''}</Text>
          </View>
        )}
      </View>

      {/* Top Right Opponent */}
      <View style={[styles.cardSlot, styles.slotRight]}>
        {rightCard ? (
          <CardView card={rightCard} />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotLabel}>{rightOpponent ? rightOpponent.substring(0, 3).toUpperCase() : ''}</Text>
          </View>
        )}
      </View>

      {/* Bottom Center (Me) */}
      <View style={[styles.cardSlot, styles.slotBottom]}>
        {myCard ? (
          <CardView card={myCard} />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotLabel}>YOU</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  trickZone: {
    width: 260,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardSlot: {
    position: 'absolute',
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  slotLeft: {
    top: 20,
    left: 10,
    transform: [{ rotate: '-15deg' }],
  },
  slotRight: {
    top: 20,
    right: 10,
    transform: [{ rotate: '15deg' }],
  },
  slotBottom: {
    bottom: 10,
  },
  emptySlot: {
    width: 72,
    height: 104,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  emptySlotLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
