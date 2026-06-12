import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { RuleSection } from './RuleSection';

export const KlondikeRulesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <PremiumModal visible={visible} title="How to Play Klondike" icon="info-circle" onClose={onClose} animationType="slide">
    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
      <RuleSection icon={<Icon name="bullseye" size={18} color="#FBBF24" />} title="Goal">
        <Text style={styles.ruleText}>Move all cards to the 4 Foundation piles (top right) in ascending order from Ace to King by suit.</Text>
      </RuleSection>
      <RuleSection icon={<Icon name="layer-group" size={18} color="#FBBF24" />} title="The Tableau (Board)">
        <Text style={styles.ruleText}>Build stacks downwards by alternating colors. For example, a Red 7 can only be placed on a Black 8.</Text>
      </RuleSection>
      <RuleSection icon={<Icon name="clone" size={18} color="#FBBF24" />} title="The Stock (Deck)">
        <Text style={styles.ruleText}>Tap the deck in the top left to draw more cards when you run out of moves.</Text>
      </RuleSection>
    </ScrollView>
    <PremiumButton title="Got it!" onPress={onClose} style={{ marginTop: 16 }} />
  </PremiumModal>
);

const styles = StyleSheet.create({
  ruleText: { color: '#D1D5DB', fontSize: 14, lineHeight: 22, marginBottom: 8 },
});
