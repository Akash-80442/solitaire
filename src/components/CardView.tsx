import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Suit } from '../types';
import { cardWidth, cardHeight } from '../constants/layout';
import { getUnicodeCard } from '../utils/deckUtils';

type CardViewProps = {
  card: Card | null;
  isFoundation?: boolean;
  foundationSuit?: Suit;
  isHinted?: boolean;
  isSelected?: boolean;
  cardStyle?: 'classic' | 'modern';
  size?: number; // multiplier: 1 = default, 0.8 = smaller, 1.2 = larger
};

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const getRankString = (rank: number): string => {
  if (rank === 1) {return 'A';}
  if (rank === 11) {return 'J';}
  if (rank === 12) {return 'Q';}
  if (rank === 13) {return 'K';}
  return rank.toString();
};

export const CardView = ({
  card,
  isFoundation = false,
  foundationSuit,
  isHinted = false,
  isSelected = false,
  cardStyle = 'modern',
  size = 1,
}: CardViewProps) => {
  const s = makeStyles(size);

  // ── Empty slot ──────────────────────────────────────────────────────────────
  if (!card) {
    const symbolColor =
      foundationSuit === 'hearts' || foundationSuit === 'diamonds'
        ? 'rgba(220, 38, 38, 0.4)'
        : 'rgba(255, 255, 255, 0.4)';
    return (
      <View style={[s.card, s.emptyCard, isHinted && s.hintedEmptyCard]}>
        {isFoundation && foundationSuit && (
          <Text style={[s.emptyFoundationText, { color: symbolColor }]}>
            {SUIT_SYMBOLS[foundationSuit]}
          </Text>
        )}
      </View>
    );
  }

  const stateStyles = [isHinted && s.hintedCard, isSelected && s.selectedCard];

  // ── Classic ─────────────────────────────────────────────────────────────────
  if (cardStyle === 'classic') {
    const char = card.isFaceUp ? getUnicodeCard(card) : '🂠';
    const color = !card.isFaceUp ? '#1E3A8A' : card.color === 'red' ? '#DC2626' : '#0F172A';
    return (
      <View style={[s.card, s.classicCard, ...stateStyles]}>
        <Text style={[s.cardUnicode, { color }]} allowFontScaling={false}>
          {char}
        </Text>
      </View>
    );
  }

  // ── Face-down ───────────────────────────────────────────────────────────────
  if (!card.isFaceUp) {
    return (
      <View style={[s.card, s.cardBack, ...stateStyles]}>
        <View style={s.cardBackInner}>
          <View style={s.cardBackCenterCircle}>
             <Text style={s.cardBackSymbol} allowFontScaling={false}>⚜</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Modern face-up ──────────────────────────────────────────────────────────
  const color = card.color === 'red' ? '#E11D48' : '#0F172A'; // Rose red or Slate dark
  const symbol = SUIT_SYMBOLS[card.suit];
  const rank = getRankString(card.rank);
  const isFaceCard = card.rank > 10 || card.rank === 1;

  return (
    <View style={[s.card, s.modernCard, ...stateStyles]}>
      <Text style={[s.watermark, { color }]} allowFontScaling={false}>{symbol}</Text>

      {isFaceCard && <View style={[s.faceCardInnerBorder, { borderColor: card.color === 'red' ? 'rgba(225, 29, 72, 0.15)' : 'rgba(15, 23, 42, 0.1)' }]} />}

      <View style={s.modernTopLeft}>
        <Text style={[s.modernCornerRank, { color }]} allowFontScaling={false}>{rank}</Text>
        <Text style={[s.modernCornerSuit, { color }]} allowFontScaling={false}>{symbol}</Text>
      </View>

      <View style={s.modernCenter}>
        <Text style={[s.modernCenterSuit, { color }]} allowFontScaling={false}>{symbol}</Text>
      </View>

      <View style={s.modernBottomRight}>
        <Text style={[s.modernCornerRank, { color }]} allowFontScaling={false}>{rank}</Text>
        <Text style={[s.modernCornerSuit, { color }]} allowFontScaling={false}>{symbol}</Text>
      </View>
    </View>
  );
};

// All proportions are identical to the original — only scaled by `size` multiplier.
const makeStyles = (size: number) => {
  const cw = cardWidth * size;
  const ch = cardHeight * size;

  return StyleSheet.create({
    card: {
      width: cw,
      height: ch,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },

    // Classic
    classicCard: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 0,
    },
    cardUnicode: {
      fontSize: Math.floor(cw * 1.5),
      lineHeight: Math.floor(cw * 1.2),
      textAlign: 'center',
      textAlignVertical: 'top',
    },

    // Face-down back
    cardBack: {
      backgroundColor: '#0F172A',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 6,
    },
    cardBackInner: {
      flex: 1,
      width: '100%',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.15)',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1E293B',
    },
    cardBackCenterCircle: {
      width: Math.floor(cw * 0.4),
      height: Math.floor(cw * 0.4),
      borderRadius: Math.floor(cw * 0.2),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0F172A',
    },
    cardBackSymbol: {
      fontSize: Math.floor(cw * 0.25),
      color: 'rgba(255,255,255,0.3)',
      lineHeight: Math.floor(cw * 0.3),
    },

    // Modern face-up
    modernCard: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 0,
      backgroundColor: '#FAFAFA',
    },
    watermark: {
      position: 'absolute',
      fontSize: Math.floor(cw * 1.2),
      opacity: 0.04,
      textAlign: 'center',
    },
    faceCardInnerBorder: {
      position: 'absolute',
      top: 8, bottom: 8, left: 8, right: 8,
      borderWidth: 1.5,
      borderRadius: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    modernTopLeft: {
      position: 'absolute',
      top: 4,
      left: 4,
      alignItems: 'center',
    },
    modernBottomRight: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      alignItems: 'center',
      transform: [{ rotate: '180deg' }],
    },
    modernCornerRank: {
      fontSize: Math.max(12, Math.floor(cw * 0.28)),
      fontWeight: '900',
      lineHeight: Math.max(12, Math.floor(cw * 0.28)),
      letterSpacing: -0.5,
    },
    modernCornerSuit: {
      fontSize: Math.max(10, Math.floor(cw * 0.24)),
      lineHeight: Math.max(10, Math.floor(cw * 0.24)),
      marginTop: 2,
    },
    modernCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modernCenterSuit: {
      fontSize: Math.floor(cw * 0.45),
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // Empty slot
    emptyCard: {
      backgroundColor: 'rgba(15, 23, 42, 0.2)',
      borderColor: 'rgba(255,255,255,0.15)',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 10,
      elevation: 0,
      shadowOpacity: 0,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 0,
    },
    hintedEmptyCard: {
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245,158,11,0.2)',
    },
    emptyFoundationText: {
      fontSize: Math.floor(cw * 0.6),
      color: 'rgba(255,255,255,0.4)',
      fontWeight: 'bold',
    },

    // State highlights
    hintedCard: {
      borderColor: '#F59E0B',
      shadowColor: '#F59E0B',
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    },
    selectedCard: {
      borderColor: '#3B82F6',
      shadowColor: '#3B82F6',
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    },
  });
};
