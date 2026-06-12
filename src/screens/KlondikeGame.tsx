import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Orientation from 'react-native-orientation-locker';

import { SUITS } from '../utils/deckUtils';
import { CardView } from '../components/CardView';
import { DraggableStack, DraggableTail } from '../components/DraggableStack';
import { useSolitaire } from '../hooks/useSolitaire';
import { PremiumModal } from '../components/ui/PremiumModal';
import { PremiumButton } from '../components/ui/PremiumButton';
import { IconButton } from '../components/ui/IconButton';
import { ScoreDashboard } from '../components/ui/ScoreDashboard';
import { GameLayout } from '../components/game/GameLayout';
import { GameSettingsModal } from '../components/game/GameSettingsModal';
import { RuleSection } from '../components/game/RuleSection';
import { KlondikeRulesModal } from '../components/game/KlondikeRulesModal';
import { cardWidth, cardHeight } from '../constants/layout';
import { Difficulty } from '../types';

export const KlondikeGame: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => { Orientation.lockToPortrait(); }, []);

  const {
    stock, waste, foundations, tableaus, startNewGame, handleStockPress, handleDrop,
    measureZone, history, undo, moves, time, score, difficulty, hintsRemaining,
    undosRemaining, hintedCardIds, getHint, selectedCardId, handleLocationTap, handleError,
    soundEnabled, setSoundEnabled, vibrationEnabled, setVibrationEnabled, cardStyle, setCardStyle,
  } = useSolitaire();

  const hasStarted = React.useRef(false);
  useEffect(() => {
    if (!hasStarted.current) {
      startNewGame('Easy');
      hasStarted.current = true;
    }
  }, [startNewGame]);

  const handleRestart = (diff: Difficulty) => {
    setShowDifficultyModal(false);
    startNewGame(diff);
  };

  return (
    <GameLayout
      title="Klondike"
      onBack={onGoBack}
      backgroundColor="#0F172A"
      showGlow={true}
      rightActions={
        <>
          <IconButton name="question" onPress={() => setShowRulesModal(true)} solid />
          <IconButton name="plus" onPress={() => setShowDifficultyModal(true)} solid />
          <IconButton name="cog" onPress={() => setShowSettings(true)} solid />
        </>
      }
    >
      <PremiumModal visible={showDifficultyModal} title="Select Difficulty" onClose={() => setShowDifficultyModal(false)}>
        <TouchableOpacity style={styles.diffBtnEasy} onPress={() => handleRestart('Easy')}>
          <Text style={styles.diffBtnText}><Icon name="circle" size={14} color="#FFFFFF" /> Easy (Draw 1, ∞ Hints/Undos)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.diffBtnMed} onPress={() => handleRestart('Medium')}>
          <Text style={styles.diffBtnText}><Icon name="adjust" size={14} color="#FFFFFF" solid /> Medium (Draw 1, 5 Hints/Undos)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.diffBtnHard} onPress={() => handleRestart('Hard')}>
          <Text style={styles.diffBtnText}><Icon name="circle" size={14} color="#FFFFFF" solid /> Hard (Draw 3, 0 Hints, 1 Undo)</Text>
        </TouchableOpacity>
        <PremiumButton title="Cancel" onPress={() => setShowDifficultyModal(false)} color="#4B5563" style={{ marginTop: 24 }} />
      </PremiumModal>

      <GameSettingsModal
        visible={showSettings} onClose={() => setShowSettings(false)}
        settings={{ cardStyle, soundEnabled, vibrationEnabled }}
        onUpdate={(k, v) => {
          if (k === 'cardStyle') setCardStyle(v);
          if (k === 'soundEnabled') setSoundEnabled(v);
          if (k === 'vibrationEnabled') setVibrationEnabled(v);
        }}
        showSound showVibration showCardStyle
      />

      <KlondikeRulesModal visible={showRulesModal} onClose={() => setShowRulesModal(false)} />

      <View style={{ marginTop: 8, marginBottom: 12 }}>
        <ScoreDashboard score={score} time={time} moves={moves} mode={difficulty} />
      </View>

      <View style={styles.board}>
        <View style={styles.topRow}>
          <View style={styles.stockWasteContainer}>
            <TouchableOpacity onPress={handleStockPress} activeOpacity={0.8} style={styles.stockContainer}>
              <CardView card={stock.length > 0 ? { ...stock[stock.length - 1], isFaceUp: false } : null} isHinted={hintedCardIds.includes('stock')} cardStyle={cardStyle} />
            </TouchableOpacity>
            <View style={[styles.wasteContainer, { height: cardHeight, zIndex: 5 }]}>
              {waste.length > 0 ? (
                <View style={{ flex: 1 }}>
                  {waste.slice(-3, -1).map((c, i) => (
                    <View key={c.id} style={{ position: 'absolute', left: i * 26, zIndex: i }}>
                      <CardView card={c} cardStyle={cardStyle} />
                    </View>
                  ))}
                  <View style={{ position: 'absolute', left: Math.min(waste.length - 1, 2) * 26, zIndex: 10 }}>
                    <DraggableStack key={waste[waste.length - 1].id} cards={[waste[waste.length - 1]]} loc={{ type: 'waste' }} stackIndex={waste.length} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} hintedCardIds={hintedCardIds} selectedCardId={selectedCardId} cardStyle={cardStyle} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleLocationTap({ type: 'waste' })} activeOpacity={0.8}><CardView card={null} cardStyle={cardStyle} /></TouchableOpacity>
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
                    <DraggableStack key={topCard.id} cards={[topCard]} loc={{ type: 'foundation', suit }} stackIndex={f.length} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} hintedCardIds={hintedCardIds} selectedCardId={selectedCardId} cardStyle={cardStyle} />
                  ) : (
                    <TouchableOpacity onPress={() => handleLocationTap({ type: 'foundation', suit })} activeOpacity={0.8}><CardView card={null} isFoundation={true} foundationSuit={suit} isHinted={hintedCardIds.includes(`foundation-${suit}`)} cardStyle={cardStyle} /></TouchableOpacity>
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
                    <CardView card={null} isHinted={hintedCardIds.includes(`empty-tableau-${colIndex}`)} cardStyle={cardStyle} />
                  </TouchableOpacity>
                )}
                {faceDownCards.map((c, i) => (
                  <View key={c.id} style={[i > 0 ? styles.tableauCardStacked : null, { zIndex: i + 1, elevation: i + 1 }]}>
                    <CardView card={c} cardStyle={cardStyle} />
                  </View>
                ))}
                {faceUpCards.length > 0 && <DraggableTail cards={colCards} index={faceDownCards.length} colIndex={colIndex} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} hintedCardIds={hintedCardIds} selectedCardId={selectedCardId} cardStyle={cardStyle} />}
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={[styles.fabUndo, (history.length === 0 || undosRemaining === 0) && { opacity: 0.5 }]} onPress={undo} disabled={history.length === 0 || undosRemaining === 0}>
        <Icon name="undo" size={20} color="#FFFFFF" />
        <Text style={styles.fabBadge}>{undosRemaining}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.fabHint, hintsRemaining === 0 && { opacity: 0.5 }]} onPress={getHint} disabled={hintsRemaining === 0}>
        <Icon name="lightbulb" size={22} color="#FFFFFF" solid />
        <Text style={styles.fabBadge}>{hintsRemaining}</Text>
      </TouchableOpacity>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  ruleText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  diffBtnEasy: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)', width: '100%', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  diffBtnMed: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.4)', width: '100%', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  diffBtnHard: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)', width: '100%', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  diffBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  board: { flex: 1, paddingHorizontal: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, zIndex: 10 },
  stockWasteContainer: { flexDirection: 'row', width: cardWidth * 2.2, justifyContent: 'space-between' },
  stockContainer: { width: cardWidth },
  wasteContainer: { width: cardWidth },
  foundationsContainer: { flexDirection: 'row', width: cardWidth * 4.4, justifyContent: 'space-between' },
  tableausContainer: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  tableauColumn: { width: cardWidth, alignItems: 'center', flex: 1 },
  tableauCardStacked: { marginTop: Math.floor(-cardHeight * 0.82) },
  fabUndo: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 30, left: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(30, 41, 59, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 },
  fabHint: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.6)', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
  fabBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', color: 'white', fontSize: 12, fontWeight: 'bold', width: 22, height: 22, borderRadius: 11, textAlign: 'center', textAlignVertical: 'center', lineHeight: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF' },
});
