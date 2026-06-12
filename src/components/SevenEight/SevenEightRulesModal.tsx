import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { RuleSection, MiniCard } from '../game/RuleSection';
import { seStyles as styles } from '../../constants/SevenEightStyles';

export const SevenEightRulesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <PremiumModal
    visible={visible}
    title="How to Play 7-8"
    icon="info-circle"
    onClose={onClose}
    contentStyle={{ padding: 20 }}
  >
    <ScrollView style={{ width: '100%', maxHeight: 460 }} showsVerticalScrollIndicator={false}>

      <RuleSection number="1" title="Winning a Trick">
        <Text style={styles.ruleBody}>
          Both players play one card. You must follow the led suit if you can. Highest card wins the trick.
        </Text>
        <View style={styles.ruleExample}>
          <View style={styles.ruleExampleItem}>
            <Text style={styles.ruleExampleLabel}>LED</Text>
            <MiniCard suit="spades" rank={10} />
          </View>
          <Text style={styles.ruleVs}>vs</Text>
          <View style={styles.ruleExampleItem}>
            <Text style={styles.ruleExampleLabel}>WINS ✓</Text>
            <MiniCard suit="spades" rank={11} />
          </View>
        </View>
      </RuleSection>

      <RuleSection number="2" title="Trump Suit">
        <Text style={styles.ruleBody}>
          A trump card beats any non-trump card, even an Ace.
        </Text>
        <View style={styles.ruleExample}>
          <View style={styles.ruleExampleItem}>
            <Text style={styles.ruleExampleLabel}>ACE LED</Text>
            <MiniCard suit="diamonds" rank={1} />
          </View>
          <Icon name="bolt" size={20} color="#F59E0B" />
          <View style={styles.ruleExampleItem}>
            <Text style={styles.ruleExampleLabel}>TRUMP WINS ✓</Text>
            <MiniCard suit="hearts" rank={8} />
          </View>
        </View>
      </RuleSection>

      <RuleSection number="3" title="Card Strength">
        <Text style={styles.ruleBody}>
          Only cards 8 and above are used. The 7♠ and 7♥ are super-cards that beat everything.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={styles.strengthRow}>
            <Text style={styles.strengthLabel}>STRONGEST</Text>
            <MiniCard suit="spades" rank={7} />
            <MiniCard suit="hearts" rank={7} />
            <Icon name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
            <MiniCard suit="spades" rank={1} />
            <Icon name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
            <MiniCard suit="spades" rank={13} />
            <Icon name="chevron-right" size={12} color="#94A3B8" style={{ marginHorizontal: 2 }} />
            <MiniCard suit="spades" rank={8} />
            <Text style={[styles.strengthLabel, { color: '#94A3B8', marginLeft: 6 }]}>WEAKEST</Text>
          </View>
        </ScrollView>
      </RuleSection>

      <RuleSection number="4" title="Winning the Round">
        <Text style={styles.ruleBody}>
          Dealer gives 5 cards. Non-Dealer picks trump, then all cards are dealt. Dealer needs 7 tricks; Non-Dealer needs 8.
        </Text>
        <View style={styles.winGoalRow}>
          <View style={styles.winGoal}>
            <Text style={styles.winGoalRole}>DEALER</Text>
            <Text style={styles.winGoalNumber}>7</Text>
            <Text style={styles.winGoalUnit}>tricks</Text>
          </View>
          <View style={styles.winGoalDivider} />
          <View style={styles.winGoal}>
            <Text style={styles.winGoalRole}>NON-DEALER</Text>
            <Text style={styles.winGoalNumber}>8</Text>
            <Text style={styles.winGoalUnit}>tricks</Text>
          </View>
        </View>
      </RuleSection>

    </ScrollView>
    <PremiumButton title="Got it!" onPress={onClose} style={{ marginTop: 16 }} />
  </PremiumModal>
);
