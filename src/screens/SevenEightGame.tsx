import React, { useEffect, useState, useMemo } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useSevenEight } from '../hooks/useSevenEight';
import { GameLayout } from '../components/game/GameLayout';
import { GameSettingsModal } from '../components/game/GameSettingsModal';
import { SevenEightRulesModal } from '../components/SevenEight/SevenEightRulesModal';
import { OpponentPanel, MyInfoBar } from '../components/SevenEight/PlayerPanel';
import { TrickZone } from '../components/SevenEight/TrickZone';
import { TrumpSelectionModal, GameOverModal } from '../components/SevenEight/SevenEightModals';
import { AnimatedHandCard } from '../components/AnimatedHandCard';
import { IconButton } from '../components/ui/IconButton';
import { socketManager } from '../utils/socketManager';
import { Card } from '../types';
import { seStyles as styles } from '../constants/SevenEightStyles';

interface SevenEightGameProps {
  onGoBack: () => void;
  seed: string;
  opponentName: string;
  isHost: boolean;
}

export const SevenEightGame: React.FC<SevenEightGameProps> = ({ onGoBack, seed, opponentName, isHost }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [cardStyle, setCardStyle] = useState<'modern' | 'classic'>('modern');

  const [roundNum, setRoundNum] = useState(1);
  const currentSeed = useMemo(() => `${seed}-r${roundNum}`, [seed, roundNum]);
  const currentIsHost = useMemo(() => (roundNum % 2 === 1) ? isHost : !isHost, [isHost, roundNum]);

  const [history, setHistory] = useState<{ round: number, myTricks: number, oppTricks: number, target: number, iWon: boolean }[]>([]);
  const [meWantsPlayAgain, setMeWantsPlayAgain] = useState(false);
  const [oppWantsPlayAgain, setOppWantsPlayAgain] = useState(false);

  const {
    phase, trumpSuit, myHand, oppHandCount, myPlay, oppPlay,
    myTricks, oppTricks, isMyTurn, targetTricks, ledSuit, trickWinner,
    selectTrump, playCard, handleOpponentSetTrump, handleOpponentPlay,
  } = useSevenEight(currentSeed, currentIsHost, (type, data) => {
    socketManager.send(`SE_${type}`, data);
  });

  useEffect(() => {
    const onSetTrump = (data: any) => handleOpponentSetTrump(data.suit);
    const onPlayCard = (data: any) => handleOpponentPlay(data.cardId);
    const onPlayAgain = () => setOppWantsPlayAgain(true);
    const handleDisconnect = () => {
      Alert.alert('Opponent Disconnected', 'Your opponent has left the game.', [{ text: 'Exit', onPress: onGoBack }]);
    };
    socketManager.on('SE_SET_TRUMP', onSetTrump);
    socketManager.on('SE_PLAY_CARD', onPlayCard);
    socketManager.on('SE_PLAY_AGAIN', onPlayAgain);
    socketManager.on('DISCONNECT', handleDisconnect);
    return () => {
      socketManager.off('SE_SET_TRUMP', onSetTrump);
      socketManager.off('SE_PLAY_CARD', onPlayCard);
      socketManager.off('SE_PLAY_AGAIN', onPlayAgain);
      socketManager.off('DISCONNECT', handleDisconnect);
    };
  }, [handleOpponentSetTrump, handleOpponentPlay, onGoBack]);

  useEffect(() => {
    if (phase === 'GAME_OVER') {
      const iWon = myTricks >= targetTricks;
      setHistory(prev => {
        if (prev.find(h => h.round === roundNum)) return prev;
        return [...prev, { round: roundNum, myTricks, oppTricks, target: targetTricks, iWon }];
      });
    }
  }, [phase, myTricks, targetTricks, oppTricks, roundNum]);

  useEffect(() => {
    if (meWantsPlayAgain && oppWantsPlayAgain) {
      setRoundNum(r => r + 1);
      setMeWantsPlayAgain(false);
      setOppWantsPlayAgain(false);
    }
  }, [meWantsPlayAgain, oppWantsPlayAgain]);

  const isCardValid = (card: Card) => {
    if (!isMyTurn || phase !== 'PLAYING') return false;
    if (!oppPlay || !ledSuit) return true;
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

  return (
    <GameLayout
      title={`7·8  ·  R${roundNum}`}
      onBack={() => { socketManager.disconnect(); onGoBack(); }}
      rightActions={
        <>
          <IconButton name="info-circle" onPress={() => setShowRules(true)} solid />
          <IconButton name="cog" onPress={() => setShowSettings(true)} solid />
        </>
      }
      showGlow={true}
    >
      <OpponentPanel opponentName={opponentName} isHost={currentIsHost} tricks={oppTricks} />

      <View style={styles.playArea}>
        <TrickZone
          trumpSuit={trumpSuit}
          phase={phase}
          isMyTurn={isMyTurn}
          trickWinner={trickWinner}
          oppPlay={oppPlay}
          myPlay={myPlay}
          opponentName={opponentName}
          cardStyle={cardStyle}
        />
      </View>

      <View style={styles.myArea}>
        <MyInfoBar isHost={currentIsHost} tricks={myTricks} targetTricks={targetTricks} />
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

      <SevenEightRulesModal visible={showRules} onClose={() => setShowRules(false)} />

      <TrumpSelectionModal
        visible={phase === 'TRUMP_SELECTION'}
        isHost={currentIsHost}
        opponentName={opponentName}
        onSelect={selectTrump}
      />

      <GameOverModal
        visible={phase === 'GAME_OVER'}
        myTricks={myTricks}
        targetTricks={targetTricks}
        oppTricks={oppTricks}
        isHost={currentIsHost}
        roundNum={roundNum}
        history={history}
        meWantsPlayAgain={meWantsPlayAgain}
        onPlayAgain={() => {
          setMeWantsPlayAgain(true);
          socketManager.send('SE_PLAY_AGAIN', {});
        }}
        onExit={() => { socketManager.disconnect(); onGoBack(); }}
      />
    </GameLayout>
  );
};