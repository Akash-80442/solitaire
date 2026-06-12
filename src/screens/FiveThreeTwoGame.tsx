import React, { useEffect, useState, useMemo } from 'react';
import { View, Alert, ScrollView, Text } from 'react-native';
import { useFiveThreeTwo } from '../hooks/useFiveThreeTwo';
import { GameLayout } from '../components/game/GameLayout';
import { OpponentsRow, MyInfoBar } from '../components/SevenEight/FiveThreeTwoPanels';
import { TrickZone3P } from '../components/SevenEight/TrickZone3P';
import { FiveThreeTwoModals } from '../components/SevenEight/FiveThreeTwoModals';
import { AnimatedHandCard } from '../components/AnimatedHandCard';
import { IconButton } from '../components/ui/IconButton';
import { socketManager } from '../utils/socketManager';
import { Card } from '../types';
import { seStyles as styles } from '../constants/SevenEightStyles';
import { GameSettingsModal } from '../components/game/GameSettingsModal';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface FiveThreeTwoGameProps {
  onGoBack: () => void;
  seed: string;
  players: string[];
  myPlayerName: string;
}

export const FiveThreeTwoGame: React.FC<FiveThreeTwoGameProps> = ({ onGoBack, seed, players, myPlayerName }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [cardStyle, setCardStyle] = useState<'modern' | 'classic'>('modern');

  const [roundNum, setRoundNum] = useState(1);
  const currentSeed = useMemo(() => `${seed}-r${roundNum}`, [seed, roundNum]);

  // Rotates players for next round (dealer passes to the left)
  // For simplicity, we just shuffle the players array based on roundNum
  const currentPlayers = useMemo(() => {
    const shift = (roundNum - 1) % 3;
    return [...players.slice(shift), ...players.slice(0, shift)];
  }, [players, roundNum]);

  const [playAgainVotes, setPlayAgainVotes] = useState<Record<string, boolean>>({});

  const {
    phase, trumpSuit, myHand, playedCards, tricksWon,
    isMyTurn, myTarget, ledSuit,
    isTrumpSelector, selectTrump, playCard,
    handleOpponentSetTrump, handleOpponentPlay, getTargetTricks
  } = useFiveThreeTwo(currentSeed, currentPlayers, myPlayerName, (type, data) => {
    socketManager.send(`532_${type}`, data);
  });

  useEffect(() => {
    const onSetTrump = (data: any) => handleOpponentSetTrump(data.suit);
    const onPlayCard = (data: any) => handleOpponentPlay(data.playerName, data.cardId);
    const onPlayAgain = (data: any) => {
      setPlayAgainVotes(prev => ({ ...prev, [data.playerName]: true }));
    };
    const handleDisconnect = () => {
      Alert.alert('Player Disconnected', 'Someone left the game.', [{ text: 'Exit', onPress: onGoBack }]);
    };
    
    socketManager.on('532_SET_TRUMP', onSetTrump);
    socketManager.on('532_PLAY_CARD', onPlayCard);
    socketManager.on('532_PLAY_AGAIN', onPlayAgain);
    socketManager.on('DISCONNECT', handleDisconnect);
    
    return () => {
      socketManager.off('532_SET_TRUMP', onSetTrump);
      socketManager.off('532_PLAY_CARD', onPlayCard);
      socketManager.off('532_PLAY_AGAIN', onPlayAgain);
      socketManager.off('DISCONNECT', handleDisconnect);
    };
  }, [handleOpponentSetTrump, handleOpponentPlay, onGoBack]);

  useEffect(() => {
    if (Object.keys(playAgainVotes).length === 3) {
      setRoundNum(r => r + 1);
      setPlayAgainVotes({});
    }
  }, [playAgainVotes]);

  const isCardValid = (card: Card) => {
    if (!isMyTurn || phase !== 'PLAYING') return false;
    if (!ledSuit) return true;
    const hasLedSuit = myHand.some(c => c.suit === ledSuit);
    return !(hasLedSuit && card.suit !== ledSuit);
  };

  const sortedHand = useMemo(() => {
    return [...myHand].sort((a, b) => {
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      const rankA = a.rank === 1 ? 14 : a.rank;
      const rankB = b.rank === 1 ? 14 : b.rank;
      return rankB - rankA;
    });
  }, [myHand]);

  const opponents = currentPlayers.filter(p => p !== myPlayerName);
  const leftOpponent = opponents[0] || 'Player 2';
  const rightOpponent = opponents[1] || 'Player 3';

  return (
    <GameLayout
      title={`5-3-2  ·  R${roundNum}`}
      onBack={() => { socketManager.disconnect(); onGoBack(); }}
      rightActions={<IconButton name="cog" onPress={() => setShowSettings(true)} solid />}
      showGlow={true}
    >
      <OpponentsRow
        leftOpponent={leftOpponent}
        leftTricks={tricksWon[leftOpponent] || 0}
        leftTarget={getTargetTricks(currentPlayers.indexOf(leftOpponent))}
        rightOpponent={rightOpponent}
        rightTricks={tricksWon[rightOpponent] || 0}
        rightTarget={getTargetTricks(currentPlayers.indexOf(rightOpponent))}
      />

      <View style={styles.playArea}>
        {trumpSuit && (
          <View style={styles.trumpIndicator}>
            <Text style={styles.trumpLabel}>TRUMP</Text>
            <Icon 
              name={trumpSuit === 'spades' || trumpSuit === 'clubs' ? 'spa' : 'heart'} 
              solid 
              size={14} 
              color={trumpSuit === 'hearts' || trumpSuit === 'diamonds' ? '#EF4444' : '#F8FAFC'} 
            />
          </View>
        )}
        <TrickZone3P 
          playedCards={playedCards}
          players={currentPlayers}
          myPlayerName={myPlayerName}
        />
      </View>

      <View style={styles.myArea}>
        <MyInfoBar tricks={tricksWon[myPlayerName] || 0} targetTricks={myTarget} />
        <View style={styles.handContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.handScroll}
            style={{ overflow: 'visible' }}
          >
            {sortedHand.map((c, i) => {
              const valid = isCardValid(c);
              const disabled = !isMyTurn || phase !== 'PLAYING' || !valid;
              return (
                <AnimatedHandCard
                  key={c.id} c={c} i={i} total={sortedHand.length}
                  disabled={disabled} valid={valid} playFn={playCard}
                  isMyTurn={isMyTurn} phase={phase} cardStyle={cardStyle}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>

      <GameSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{ cardStyle }}
        onUpdate={(_, val) => setCardStyle(val)}
        showCardStyle
      />

      <FiveThreeTwoModals
        phase={phase}
        isTrumpSelector={isTrumpSelector}
        onSelectTrump={selectTrump}
        tricksWon={tricksWon}
        players={currentPlayers}
        getTargetTricks={getTargetTricks}
        onNextRound={() => {
          socketManager.send('532_PLAY_AGAIN', { playerName: myPlayerName });
          setPlayAgainVotes(prev => ({ ...prev, [myPlayerName]: true }));
        }}
        onEndGame={() => { socketManager.disconnect(); onGoBack(); }}
      />
    </GameLayout>
  );
};
