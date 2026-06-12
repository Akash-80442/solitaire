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

      <RuleSection number="1" title="The Setup & Trump">
        <Text style={styles.ruleBody}>
          7-8 is a 2-player game played with 30 cards. The Dealer gives 5 cards to each player. 
          The Non-Dealer looks at their 5 cards and selects the "Trump Suit". 
          After the Trump is chosen, the rest of the cards are dealt.
        </Text>
        <View style={styles.ruleExample}>
          <Icon name="hand-holding-heart" size={20} color="#F59E0B" />
          <Text style={[styles.ruleExampleLabel, { fontSize: 11, color: '#F8FAFC' }]}>NON-DEALER CHOOSES TRUMP</Text>
        </View>
      </RuleSection>

      <RuleSection number="2" title="Winning a Trick">
        <Text style={styles.ruleBody}>
          The Non-Dealer plays the very first card. Both players play one card per "trick". 
          You MUST follow the led suit if you have it. The highest card of the led suit wins the trick.
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

      <RuleSection number="3" title="Using Trump Cards">
        <Text style={styles.ruleBody}>
          If you don't have the led suit, you can play a Trump card! 
          A trump card beats ANY non-trump card, even an Ace. If both players play a Trump, the highest Trump wins.
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

      <RuleSection number="4" title="Card Strength">
        <Text style={styles.ruleBody}>
          Only cards 8 and above are used (Aces are high). 
          The 7♠ and 7♥ are included and they are SUPER CARDS. 7♠ is the strongest card in the game, followed by 7♥.
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

      <RuleSection number="5" title="Winning the Round">
        <Text style={styles.ruleBody}>
          The game has 15 total tricks. To win the round, you must win the target number of tricks based on your role:
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
