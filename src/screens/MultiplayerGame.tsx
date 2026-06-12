import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Orientation from 'react-native-orientation-locker';

import { SUITS } from '../utils/deckUtils';
import { CardView } from '../components/CardView';
import { DraggableStack, DraggableTail } from '../components/DraggableStack';
import { useSolitaire } from '../hooks/useSolitaire';
import { GameLayout } from '../components/game/GameLayout';
import { cardWidth, cardHeight } from '../constants/layout';
import { socketManager } from '../utils/socketManager';

interface MultiplayerGameProps {
  onGoBack: () => void;
  seed: string;
  opponentName: string;
  isHost: boolean;
}

const formatTime = (time: number) => {
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = (time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ onGoBack, seed, opponentName }) => {
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => { Orientation.lockToPortrait(); }, []);

  const {
    stock, waste, foundations, tableaus, startNewGame, handleStockPress, handleDrop,
    measureZone, history, undo, moves, time, score, selectedCardId, handleLocationTap,
    handleError, cardStyle,
  } = useSolitaire();

  const hasStarted = useRef(false);
  const prevScore = useRef(0);

  useEffect(() => {
    if (!hasStarted.current) {
      startNewGame('Medium', seed);
      hasStarted.current = true;
    }
  }, [startNewGame, seed]);

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      socketManager.send('UPDATE_SCORE', { score });

      const totalCards = Object.values(foundations).reduce((acc, f) => acc + f.length, 0);
      if (totalCards === 52) {
        socketManager.send('GAME_WON', {});
        Alert.alert('You Won!', 'You beat your opponent!', [{ text: 'Exit', onPress: onGoBack }]);
      }
    }
  }, [score, foundations, onGoBack, opponentName]);

  useEffect(() => {
    const handleOpponentScore = (data: any) => setOpponentScore(data.score);
    const handleGameOver = () => Alert.alert('Game Over', `${opponentName} finished the deck first!`, [{ text: 'Exit', onPress: onGoBack }]);
    const handleDisconnect = () => Alert.alert('Opponent Disconnected', 'Your opponent has left the game.', [{ text: 'Exit', onPress: onGoBack }]);

    socketManager.on('UPDATE_SCORE', handleOpponentScore);
    socketManager.on('GAME_WON', handleGameOver);
    socketManager.on('DISCONNECT', handleDisconnect);

    return () => {
      socketManager.off('UPDATE_SCORE', handleOpponentScore);
      socketManager.off('GAME_WON', handleGameOver);
      socketManager.off('DISCONNECT', handleDisconnect);
    };
  }, [onGoBack, opponentName]);

  return (
    <GameLayout
      title="Showdown"
      onBack={() => { socketManager.disconnect(); onGoBack(); }}
      backgroundColor="#4F46E5"
      showGlow={false}
      rightActions={<Text style={{ color: '#E5E7EB', fontWeight: 'bold' }}>vs {opponentName}</Text>}
    >
      <View style={styles.dashboard}>
        <View style={styles.dashScoreBox}>
          <Text style={[styles.dashScoreLabel, { color: '#38BDF8' }]}>YOU</Text>
          <Text style={[styles.dashScoreValue, { color: '#38BDF8' }]}>{score}</Text>
        </View>
        <View style={styles.dashDividerVertical} />
        <View style={styles.dashStatsBox}>
          <Text style={styles.dashStatText}><Icon name="clock" size={12} color="#9CA3AF" />  {formatTime(time)}</Text>
          <Text style={styles.dashStatText}><Icon name="shoe-prints" size={12} color="#9CA3AF" />  {moves}</Text>
        </View>
        <View style={styles.dashDividerVertical} />
        <View style={styles.dashScoreBox}>
          <Text style={[styles.dashScoreLabel, { color: '#F43F5E' }]}>{opponentName.toUpperCase()}</Text>
          <Text style={[styles.dashScoreValue, { color: '#F43F5E' }]}>{opponentScore}</Text>
        </View>
      </View>

      <View style={styles.board}>
        <View style={styles.topRow}>
          <View style={styles.stockWasteContainer}>
            <TouchableOpacity onPress={handleStockPress} activeOpacity={0.8} style={styles.stockContainer}>
              <CardView card={stock.length > 0 ? { ...stock[stock.length - 1], isFaceUp: false } : null} cardStyle={cardStyle} />
            </TouchableOpacity>
            <View style={[styles.wasteContainer, { height: cardHeight, zIndex: 5 }]}>
              {waste.length > 0 ? (
                <View style={{ flex: 1 }}>
                  {waste.slice(-3, -1).map((c, i) => (
                    <View key={c.id} style={{ position: 'absolute', left: i * 22, zIndex: i }}>
                      <CardView card={c} cardStyle={cardStyle} />
                    </View>
                  ))}
                  <View style={{ position: 'absolute', left: Math.min(waste.length - 1, 2) * 22, zIndex: 10 }}>
                    <DraggableStack key={waste[waste.length - 1].id} cards={[waste[waste.length - 1]]} loc={{ type: 'waste' }} stackIndex={waste.length} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} selectedCardId={selectedCardId} cardStyle={cardStyle} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleLocationTap({ type: 'waste' })} activeOpacity={0.8}>
                  <CardView card={null} cardStyle={cardStyle} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.foundationsContainer}>
            {SUITS.map((suit) => {
              const f = foundations[suit];
              const topCard = f.length > 0 ? f[f.length - 1] : null;
              return (
                <View key={suit} ref={measureZone(`foundation-${suit}`)}>
                  {topCard ? (
                    <DraggableStack key={topCard.id} cards={[topCard]} loc={{ type: 'foundation', suit }} stackIndex={f.length} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} selectedCardId={selectedCardId} cardStyle={cardStyle} />
                  ) : (
                    <TouchableOpacity onPress={() => handleLocationTap({ type: 'foundation', suit })} activeOpacity={0.8}>
                      <CardView card={null} isFoundation={true} foundationSuit={suit} cardStyle={cardStyle} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.tableausContainer}>
          {tableaus.map((colCards, colIndex) => {
            const faceDownCards = colCards.filter(c => !c.isFaceUp);
            const faceUpCards = colCards.filter(c => c.isFaceUp);
            return (
              <View key={colIndex} style={styles.tableauColumn} ref={measureZone(`tableau-${colIndex}`)}>
                {colCards.length === 0 && (
                  <TouchableOpacity onPress={() => handleLocationTap({ type: 'tableau', col: colIndex })} activeOpacity={0.8}>
                    <CardView card={null} cardStyle={cardStyle} />
                  </TouchableOpacity>
                )}
                {faceDownCards.map((c, i) => (
                  <View key={c.id} style={[i > 0 ? styles.tableauCardStacked : null, { zIndex: i + 1, elevation: i + 1 }]}>
                    <CardView card={c} cardStyle={cardStyle} />
                  </View>
                ))}
                {faceUpCards.length > 0 && <DraggableTail cards={colCards} index={faceDownCards.length} colIndex={colIndex} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} selectedCardId={selectedCardId} cardStyle={cardStyle} />}
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={[styles.fabUndo, history.length === 0 && { opacity: 0.5 }]} onPress={undo} disabled={history.length === 0}>
        <Icon name="undo" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  dashboard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  dashScoreBox: { flex: 1, alignItems: 'center' },
  dashScoreLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  dashScoreValue: { fontSize: 24, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  dashDividerVertical: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 12 },
  dashStatsBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  dashStatText: { color: '#E5E7EB', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  board: { flex: 1, paddingHorizontal: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, zIndex: 10 },
  stockWasteContainer: { flexDirection: 'row', width: cardWidth * 2.2, justifyContent: 'space-between' },
  stockContainer: { width: cardWidth },
  wasteContainer: { width: cardWidth },
  foundationsContainer: { flexDirection: 'row', width: cardWidth * 4.4, justifyContent: 'space-between' },
  tableausContainer: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  tableauColumn: { width: cardWidth, alignItems: 'center', flex: 1 },
  tableauCardStacked: { marginTop: Math.floor(-cardHeight * 0.82) },
  fabUndo: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 40, left: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 8 },
});
