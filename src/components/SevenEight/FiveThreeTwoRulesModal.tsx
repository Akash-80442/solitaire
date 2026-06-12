import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { RuleSection, MiniCard } from '../game/RuleSection';
import { seStyles as styles } from '../../constants/SevenEightStyles';

export const FiveThreeTwoRulesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <PremiumModal
    visible={visible}
    title="How to Play 5-3-2"
    icon="info-circle"
    onClose={onClose}
    contentStyle={{ padding: 20 }}
  >
    <ScrollView style={{ width: '100%', maxHeight: 460 }} showsVerticalScrollIndicator={false}>

      <RuleSection number="1" title="Winning a Trick">
        <Text style={styles.ruleBody}>
          Players take turns playing one card each. You must follow the led suit if you can. The highest card of the led suit wins, unless a trump card is played.
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
          If you don't have the led suit, you can play a trump card. A trump card beats any non-trump card. If multiple trump cards are played, the highest trump wins.
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
          Aces are the highest cards, followed by King, Queen, Jack, 10, 9, 8, and the 7♠ and 7♥ are the lowest cards in the game.
        </Text>
      </RuleSection>

      <RuleSection number="4" title="Winning the Round">
        <Text style={styles.ruleBody}>
          Every player has a target number of tricks they need to win based on their role:
        </Text>
        <View style={styles.winGoalRow}>
          <View style={styles.winGoal}>
            <Text style={styles.winGoalRole}>TRUMP CHOOSER</Text>
            <Text style={styles.winGoalNumber}>5</Text>
            <Text style={styles.winGoalUnit}>tricks</Text>
          </View>
          <View style={styles.winGoalDivider} />
          <View style={styles.winGoal}>
            <Text style={styles.winGoalRole}>THIRD PLAYER</Text>
            <Text style={styles.winGoalNumber}>3</Text>
            <Text style={styles.winGoalUnit}>tricks</Text>
          </View>
          <View style={styles.winGoalDivider} />
          <View style={styles.winGoal}>
            <Text style={styles.winGoalRole}>DEALER</Text>
            <Text style={styles.winGoalNumber}>2</Text>
            <Text style={styles.winGoalUnit}>tricks</Text>
          </View>
        </View>
      </RuleSection>

    </ScrollView>
    <PremiumButton title="Got it!" onPress={onClose} style={{ marginTop: 16 }} />
  </PremiumModal>
);
