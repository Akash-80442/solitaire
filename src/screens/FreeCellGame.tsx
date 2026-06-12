import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Orientation from 'react-native-orientation-locker';

import { SUITS } from '../utils/deckUtils';
import { CardView } from '../components/CardView';
import { DraggableStack, DraggableTail } from '../components/DraggableStack';
import { useFreeCell } from '../hooks/useFreeCell';
import { PremiumModal } from '../components/ui/PremiumModal';
import { PremiumButton } from '../components/ui/PremiumButton';
import { IconButton } from '../components/ui/IconButton';
import { ScoreDashboard } from '../components/ui/ScoreDashboard';
import { GameLayout } from '../components/game/GameLayout';
import { GameSettingsModal } from '../components/game/GameSettingsModal';
import { RuleSection } from '../components/game/RuleSection';
import { cardWidth, cardHeight } from '../constants/layout';

export const FreeCellGame: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    Orientation.lockToLandscape();
    return () => Orientation.lockToPortrait();
  }, []);

  const {
    freeCells, foundations, tableaus, startNewGame, handleDrop, measureZone, history,
    undo, moves, time, score, difficulty, hintsRemaining, undosRemaining, hintedCardIds,
    getHint, selectedCardId, handleLocationTap, handleError, soundEnabled,
    setSoundEnabled, vibrationEnabled, setVibrationEnabled, cardStyle, setCardStyle,
  } = useFreeCell();

  const hasStarted = React.useRef(false);
  useEffect(() => {
    if (!hasStarted.current) {
      startNewGame('Easy');
      hasStarted.current = true;
    }
  }, [startNewGame]);

  return (
    <GameLayout
      title="FreeCell"
      onBack={onGoBack}
      backgroundColor="#0B2B1B"
      showGlow={false}
      rightActions={
        <>
          <IconButton name="question" onPress={() => setShowRulesModal(true)} solid />
          <IconButton name="plus" onPress={() => startNewGame(difficulty)} solid />
          <IconButton name="cog" onPress={() => setShowSettings(true)} solid />
        </>
      }
    >
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

      <PremiumModal visible={showRulesModal} title="How to Play FreeCell" icon="info-circle" onClose={() => setShowRulesModal(false)} animationType="slide">
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          <RuleSection icon={<Icon name="bullseye" size={18} color="#38BDF8" />} title="Goal">
            <Text style={styles.ruleText}>Move all cards to the 4 Foundation piles (top right) in ascending order from Ace to King by suit.</Text>
          </RuleSection>
          <RuleSection icon={<Icon name="cubes" size={18} color="#38BDF8" />} title="Free Cells (Top Left)">
            <Text style={styles.ruleText}>You have 4 empty cells. Any single card can be temporarily stored here to get it out of the way.</Text>
          </RuleSection>
          <RuleSection icon={<Icon name="layer-group" size={18} color="#38BDF8" />} title="The Tableau (Board)">
            <Text style={styles.ruleText}>Build stacks downwards by alternating colors. All cards are dealt face-up.</Text>
          </RuleSection>
          <RuleSection icon={<Icon name="project-diagram" size={18} color="#38BDF8" />} title="Moving Stacks">
            <Text style={styles.ruleText}>You can only move multiple cards if you have enough empty Free Cells or empty columns. The game blocks invalid moves.</Text>
          </RuleSection>
        </ScrollView>
        <PremiumButton title="Got it!" onPress={() => setShowRulesModal(false)} style={{ marginTop: 16 }} />
      </PremiumModal>

      <View style={{ marginTop: 20 }}>
        <ScoreDashboard score={score} time={time} moves={moves} />
      </View>

      <View style={styles.board}>
        <View style={styles.topRow}>
          <View style={styles.freeCellsContainer}>
            {freeCells.map((card, i) => (
              <View key={`fc-${i}`} style={styles.freeCellSlot} ref={measureZone(`freecell-${i}`)}>
                {card ? (
                  <DraggableStack key={card.id} cards={[card]} loc={{ type: 'freecell', index: i }} stackIndex={1} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} hintedCardIds={hintedCardIds} selectedCardId={selectedCardId} cardStyle={cardStyle} />
                ) : (
                  <TouchableOpacity onPress={() => handleLocationTap({ type: 'freecell', index: i })} activeOpacity={0.8} style={styles.emptySlot}>
                     <Icon name="cube" size={16} color="rgba(255,255,255,0.15)" solid />
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
                    <TouchableOpacity onPress={() => handleLocationTap({ type: 'foundation', suit })} activeOpacity={0.8}>
                      <CardView card={null} isFoundation={true} foundationSuit={suit} isHinted={hintedCardIds.includes(`foundation-${suit}`)} cardStyle={cardStyle} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.tableausContainer}>
          {tableaus.map((colCards, colIndex) => (
            <View key={colIndex} style={styles.tableauColumn} ref={measureZone(`tableau-${colIndex}`)}>
              {colCards.length === 0 && (
                <TouchableOpacity onPress={() => handleLocationTap({ type: 'tableau', col: colIndex })} activeOpacity={0.8}>
                  <CardView card={null} isHinted={hintedCardIds.includes(`empty-tableau-${colIndex}`)} cardStyle={cardStyle} />
                </TouchableOpacity>
              )}
              {colCards.length > 0 && <DraggableTail cards={colCards} index={0} colIndex={colIndex} onDrop={handleDrop} onLocationTap={handleLocationTap} onError={handleError} hintedCardIds={hintedCardIds} selectedCardId={selectedCardId} cardStyle={cardStyle} />}
            </View>
          ))}
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
  board: { flex: 1, paddingHorizontal: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, zIndex: 10 },
  freeCellsContainer: { flexDirection: 'row', width: cardWidth * 4.2, justifyContent: 'space-between' },
  freeCellSlot: { width: cardWidth, height: cardHeight },
  emptySlot: { width: cardWidth, height: cardHeight, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  foundationsContainer: { flexDirection: 'row', width: cardWidth * 4.2, justifyContent: 'space-between' },
  tableausContainer: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  tableauColumn: { width: cardWidth, alignItems: 'center', flex: 1 },
  fabUndo: { position: 'absolute', bottom: 40, left: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  fabHint: { position: 'absolute', bottom: 40, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  fabBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', color: 'white', fontSize: 12, fontWeight: 'bold', width: 22, height: 22, borderRadius: 11, textAlign: 'center', textAlignVertical: 'center', lineHeight: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF' },
});
