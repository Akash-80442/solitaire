import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { TrickCardView } from '../TrickCardView';
import { Card, Suit } from '../../types';
import { seStyles as styles } from '../../constants/SevenEightStyles';

interface TrickZoneProps {
  trumpSuit: Suit | null;
  phase: string;
  isMyTurn: boolean;
  trickWinner: 'me' | 'opponent' | null;
  oppPlay: Card | null;
  myPlay: Card | null;
  opponentName: string;
  cardStyle: 'modern' | 'classic';
}

const getSuitSymbol = (suit: Suit) => {
  const map: Record<Suit, string> = { hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣' };
  return map[suit] ?? '';
};

const getSuitColor = (suit: Suit) =>
  suit === 'hearts' || suit === 'diamonds' ? '#EF4444' : '#1F2937';

export const TrickZone: React.FC<TrickZoneProps> = ({
  trumpSuit, phase, isMyTurn, trickWinner, oppPlay, myPlay, opponentName, cardStyle
}) => {
  return (
    <>
      {trumpSuit && phase !== 'GAME_OVER' && phase !== 'TRUMP_SELECTION' && (
        <View style={styles.trumpIndicator}>
          <Text style={styles.trumpLabel}>TRUMP</Text>
          <Text style={[styles.trumpSuitSymbol, { color: getSuitColor(trumpSuit) }]}>
            {getSuitSymbol(trumpSuit)}
          </Text>
        </View>
      )}

      {phase === 'PLAYING' && !trickWinner && (
        <View style={[styles.turnBadge, isMyTurn ? styles.turnBadgeMine : styles.turnBadgeOpp]}>
          <View style={[styles.turnDot, { backgroundColor: isMyTurn ? '#10B981' : '#EF4444' }]} />
          <Text style={[styles.turnBadgeText, { color: isMyTurn ? '#10B981' : '#EF4444' }]}>
            {isMyTurn ? 'YOUR TURN' : `${opponentName.split(' ')[0].toUpperCase()}'S TURN`}
          </Text>
        </View>
      )}

      <View style={styles.trickZone}>
        <View style={styles.tableRing} />

        {trickWinner && (
          <View style={[
            styles.trickWinnerBadge,
            { backgroundColor: trickWinner === 'me' ? '#059669' : '#DC2626' },
          ]}>
            <Icon
              name={trickWinner === 'me' ? 'check' : 'times'}
              size={12} color="#FFF" solid
              style={{ marginRight: 6 }}
            />
            <Text style={styles.trickWinnerText}>
              {trickWinner === 'me' ? 'You took it!' : 'They took it!'}
            </Text>
          </View>
        )}

        <View style={styles.cardSlot}>
          {oppPlay ? (
            <TrickCardView card={oppPlay} cardStyle={cardStyle} direction="down" />
          ) : (
            <View style={styles.emptySlot}>
              <Icon name="arrow-down" size={18} color="rgba(255,255,255,0.25)" />
              <Text style={styles.emptySlotLabel}>
                {!isMyTurn && phase === 'PLAYING' ? 'THINKING' : 'OPP'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.slotDivider} />

        <View style={styles.cardSlot}>
          {myPlay ? (
            <TrickCardView card={myPlay} cardStyle={cardStyle} direction="up" />
          ) : (
            <View style={[styles.emptySlot, isMyTurn && phase === 'PLAYING' && styles.emptySlotActive]}>
              <Icon
                name="arrow-up" size={18}
                color={isMyTurn && phase === 'PLAYING' ? '#10B981' : 'rgba(255,255,255,0.25)'}
              />
              <Text style={[
                styles.emptySlotLabel,
                isMyTurn && phase === 'PLAYING' && { color: '#10B981' },
              ]}>
                {isMyTurn && phase === 'PLAYING' ? 'PLAY' : 'YOU'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};
