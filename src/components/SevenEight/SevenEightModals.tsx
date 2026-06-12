import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { Suit } from '../../types';
import { seStyles as styles } from '../../constants/SevenEightStyles';

const getSuitSymbol = (suit: Suit) => {
  const map: Record<Suit, string> = { hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣' };
  return map[suit] ?? '';
};

const getSuitColor = (suit: Suit) =>
  suit === 'hearts' || suit === 'diamonds' ? '#EF4444' : '#1F2937';

interface TrumpSelectionProps {
  visible: boolean;
  isHost: boolean;
  opponentName: string;
  onSelect: (suit: Suit) => void;
}

export const TrumpSelectionModal: React.FC<TrumpSelectionProps> = ({ visible, isHost, opponentName, onSelect }) => (
  <PremiumModal visible={visible} animationType="fade">
    {!isHost ? (
      <>
        <Text style={styles.modalTitle}>Pick Trump Suit</Text>
        <Text style={styles.modalSub}>Choose based on your first 5 cards.</Text>
        <View style={styles.suitGrid}>
          {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map(suit => (
            <TouchableOpacity
              key={suit}
              style={[styles.suitBtn, { borderColor: getSuitColor(suit) + '33' }]}
              onPress={() => onSelect(suit)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suitIcon, { color: getSuitColor(suit) }]}>
                {getSuitSymbol(suit)}
              </Text>
              <Text style={[styles.suitName, { color: getSuitColor(suit) }]}>
                {suit.charAt(0).toUpperCase() + suit.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    ) : (
      <View style={styles.waitingContainer}>
        <View style={styles.waitingIcon}>
          <Icon name="hourglass-half" size={28} color="#10B981" />
        </View>
        <Text style={styles.modalTitle}>Waiting…</Text>
        <Text style={styles.modalSub}>{opponentName} is choosing the trump suit</Text>
      </View>
    )}
  </PremiumModal>
);

interface HistoryItem { round: number, myTricks: number, oppTricks: number, target: number, iWon: boolean }

interface GameOverModalProps {
  visible: boolean;
  myTricks: number;
  targetTricks: number;
  oppTricks: number;
  isHost: boolean;
  roundNum: number;
  history: HistoryItem[];
  meWantsPlayAgain: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible, myTricks, targetTricks, oppTricks, isHost, roundNum, history, meWantsPlayAgain, onPlayAgain, onExit
}) => {
  const wonWins = history.reduce((acc, h) => acc + (h.iWon ? 1 : 0), 0);
  const oppWins = history.reduce((acc, h) => acc + (h.iWon ? 0 : 1), 0);

  return (
    <PremiumModal visible={visible} animationType="slide" contentStyle={{ width: '90%' }}>
      <View style={[
        styles.resultHero,
        { backgroundColor: myTricks >= targetTricks ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' },
      ]}>
        <Icon
          name={myTricks >= targetTricks ? 'trophy' : 'times-circle'}
          size={40}
          color={myTricks >= targetTricks ? '#F59E0B' : '#EF4444'}
        />
        <Text style={[styles.resultTitle, { color: myTricks >= targetTricks ? '#10B981' : '#EF4444' }]}>
          {myTricks >= targetTricks ? 'You Won!' : 'You Lost!'}
        </Text>
        <Text style={styles.resultSub}>
          Round {roundNum}: {myTricks} of {targetTricks} tricks needed
        </Text>
      </View>

      <View style={styles.scoreBreakdown}>
        <View style={styles.scoreBreakdownRow}>
          <Text style={styles.scoreBreakdownLabel}>You</Text>
          <View style={styles.scoreBreakdownBar}>
            <View style={[styles.scoreBarFill, { flex: myTricks, backgroundColor: '#10B981' }]} />
            <View style={[styles.scoreBarFill, { flex: Math.max(0, targetTricks - myTricks), backgroundColor: '#E2E8F0' }]} />
          </View>
          <Text style={styles.scoreBreakdownNum}>{myTricks}/{targetTricks}</Text>
        </View>
        <View style={styles.scoreBreakdownRow}>
          <Text style={styles.scoreBreakdownLabel}>Opp</Text>
          <View style={styles.scoreBreakdownBar}>
            <View style={[styles.scoreBarFill, { flex: oppTricks, backgroundColor: '#EF4444' }]} />
            <View style={[styles.scoreBarFill, { flex: Math.max(0, (isHost ? 7 : 8) - oppTricks), backgroundColor: '#E2E8F0' }]} />
          </View>
          <Text style={styles.scoreBreakdownNum}>{oppTricks}</Text>
        </View>
      </View>

      {history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historySectionTitle}>Series Score</Text>
            <View style={styles.seriesPill}>
              <Text style={[styles.seriesNum, { color: wonWins >= oppWins ? '#10B981' : '#EF4444' }]}>{wonWins}</Text>
              <Text style={styles.seriesDash}> – </Text>
              <Text style={[styles.seriesNum, { color: oppWins > wonWins ? '#EF4444' : '#64748B' }]}>{oppWins}</Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
            {history.map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyRound}>R{h.round}</Text>
                <View style={[styles.historyResultDot, { backgroundColor: h.iWon ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.historyScore, { color: h.iWon ? '#10B981' : '#EF4444' }]}>
                  {h.myTricks} – {h.oppTricks}
                </Text>
                <Text style={styles.historyOutcome}>{h.iWon ? 'Win' : 'Loss'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.gameOverActions}>
        <PremiumButton
          title={meWantsPlayAgain ? 'Waiting for opp…' : '🔄  Play Again'}
          onPress={onPlayAgain}
          disabled={meWantsPlayAgain}
          style={{ flex: 1 }}
        />
        <PremiumButton title="Exit" onPress={onExit} color="#EF4444" style={{ flex: 1 }} />
      </View>
    </PremiumModal>
  );
};
