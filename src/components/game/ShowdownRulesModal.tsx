import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { RuleSection } from './RuleSection';

export const ShowdownRulesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <PremiumModal visible={visible} title="How to Play Showdown" icon="wifi" onClose={onClose} animationType="slide">
    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
      <RuleSection icon={<Icon name="tachometer-alt" size={18} color="#EC4899" />} title="The Race">
        <Text style={styles.ruleText}>You and your opponent play the exact same Klondike Solitaire deck simultaneously. The first player to move all 52 cards to the foundations wins!</Text>
      </RuleSection>
      <RuleSection icon={<Icon name="broadcast-tower" size={18} color="#EC4899" />} title="Live Multiplayer">
        <Text style={styles.ruleText}>You will see your opponent's live score updating in real-time as you both race to complete the game.</Text>
      </RuleSection>
      <RuleSection icon={<Icon name="layer-group" size={18} color="#EC4899" />} title="Same Rules">
        <Text style={styles.ruleText}>All standard Klondike rules apply. Build stacks downwards by alternating colors, and foundations upwards by suit from Ace to King.</Text>
      </RuleSection>
    </ScrollView>
    <PremiumButton title="Got it!" onPress={onClose} style={{ marginTop: 16 }} />
  </PremiumModal>
);

const styles = StyleSheet.create({
  ruleText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22, marginBottom: 8 },
});
