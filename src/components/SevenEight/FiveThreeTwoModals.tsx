import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Suit } from '../types';
import { PremiumModal } from '../ui/PremiumModal';
import { seStyles as styles } from '../../constants/SevenEightStyles';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface FiveThreeTwoModalsProps {
  phase: string;
  isTrumpSelector: boolean;
  onSelectTrump: (suit: Suit) => void;
  onNextRound: () => void;
  onEndGame: () => void;
  tricksWon: Record<string, number>;
  players: string[];
  getTargetTricks: (index: number) => number;
}

export const FiveThreeTwoModals: React.FC<FiveThreeTwoModalsProps> = ({
  phase,
  isTrumpSelector,
  onSelectTrump,
  onNextRound,
  onEndGame,
  tricksWon,
  players,
  getTargetTricks,
}) => {
  const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const getSuitIcon = (suit: Suit) => {
    switch (suit) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
    }
  };

  const getSuitColor = (suit: Suit) => (suit === 'hearts' || suit === 'diamonds' ? '#EF4444' : '#F8FAFC');

  return (
    <>
      <PremiumModal visible={phase === 'TRUMP_SELECTION'} animationType="slide">
        <Text style={styles.modalTitle}>Trump Selection</Text>
        {isTrumpSelector ? (
          <>
            <Text style={styles.modalSub}>You must make 5 tricks. Choose the Trump suit based on your first 5 cards.</Text>
            <View style={styles.suitGrid}>
              {SUITS.map(suit => (
                <TouchableOpacity
                  key={suit}
                  style={styles.suitBtn}
                  onPress={() => onSelectTrump(suit)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suitIcon, { color: getSuitColor(suit) }]}>
                    {getSuitIcon(suit)}
                  </Text>
                  <Text style={styles.suitName}>{suit.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <View style={styles.waitingIcon}>
              <Icon name="hourglass-half" size={24} color="#10B981" />
            </View>
            <Text style={styles.modalSub}>Waiting for Player 2 to choose Trump...</Text>
          </View>
        )}
      </PremiumModal>

      <PremiumModal visible={phase === 'GAME_OVER'} animationType="fade">
        <View style={styles.resultHero}>
          <Text style={[styles.resultTitle, { color: '#F8FAFC' }]}>Round Over</Text>
          <Text style={styles.resultSub}>Tricks vs Quota</Text>
        </View>

        <View style={styles.scoreBreakdown}>
          {players.map((p, index) => {
            const target = getTargetTricks(index);
            const actual = tricksWon[p] || 0;
            const diff = actual - target;
            const diffColor = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#94A3B8';

            return (
              <View key={p} style={[styles.scoreBreakdownRow, { marginBottom: 12 }]}>
                <Text style={[styles.scoreBreakdownLabel, { width: 60, color: '#F8FAFC' }]} numberOfLines={1}>
                  {p.substring(0, 5)}
                </Text>
                <View style={[styles.scoreBreakdownBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <View style={[styles.scoreBarFill, { width: `${(actual / 10) * 100}%`, backgroundColor: '#38BDF8' }]} />
                </View>
                <Text style={[styles.scoreBreakdownNum, { color: '#F8FAFC', width: 40 }]}>
                  {actual}/{target}
                </Text>
                <Text style={[styles.scoreBreakdownNum, { color: diffColor, width: 30 }]}>
                  {diff > 0 ? `+${diff}` : diff}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.gameOverActions}>
          <TouchableOpacity style={[styles.suitBtn, { flex: 1, height: 50 }]} onPress={onNextRound}>
            <Text style={styles.suitName}>NEXT ROUND</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.suitBtn, { flex: 1, height: 50, backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} onPress={onEndGame}>
            <Text style={styles.suitName}>QUIT</Text>
          </TouchableOpacity>
        </View>
      </PremiumModal>
    </>
  );
};
