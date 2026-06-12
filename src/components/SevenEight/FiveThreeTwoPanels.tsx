import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { seStyles } from '../../constants/SevenEightStyles';

interface OpponentsRowProps {
  leftOpponent: string;
  leftTricks: number;
  leftTarget: number;
  rightOpponent: string;
  rightTricks: number;
  rightTarget: number;
}

export const OpponentsRow: React.FC<OpponentsRowProps> = ({
  leftOpponent, leftTricks, leftTarget,
  rightOpponent, rightTricks, rightTarget
}) => (
  <View style={styles.opponentsContainer}>
    <View style={styles.oppPanel}>
      <View style={styles.oppHeader}>
        <Icon name="user-astronaut" size={14} color="#94A3B8" />
        <Text style={styles.oppName} numberOfLines={1}>{leftOpponent}</Text>
      </View>
      <View style={styles.oppScore}>
        <Text style={styles.scoreText}>{String(leftTricks)}/{String(leftTarget)}</Text>
      </View>
    </View>

    <View style={styles.oppPanel}>
      <View style={styles.oppHeader}>
        <Text style={styles.oppName} numberOfLines={1}>{rightOpponent}</Text>
        <Icon name="user-astronaut" size={14} color="#94A3B8" />
      </View>
      <View style={styles.oppScore}>
        <Text style={styles.scoreText}>{String(rightTricks)}/{String(rightTarget)}</Text>
      </View>
    </View>
  </View>
);

interface MyInfoBarProps {
  tricks: number;
  targetTricks: number;
}

export const MyInfoBar: React.FC<MyInfoBarProps> = ({ tricks, targetTricks }) => (
  <View style={seStyles.myInfoBar}>
    <View style={seStyles.playerIdentity}>
      <View style={[seStyles.avatarCircle, seStyles.myAvatarCircle]}>
        <Icon name="user" size={16} color="#10B981" />
      </View>
      <View style={seStyles.playerMeta}>
        <Text style={seStyles.myPlayerName}>You</Text>
        <View style={[seStyles.roleBadge, seStyles.myRoleBadge]}>
          <Text style={[seStyles.roleText, seStyles.myRoleText]}>
            TARGET: {String(targetTricks)}
          </Text>
        </View>
      </View>
    </View>

    <View style={seStyles.myTrickCounter}>
      <Text style={seStyles.myTrickBig}>{String(tricks)}</Text>
      <Text style={seStyles.myTrickOf}>/{String(targetTricks)}</Text>
      <Text style={seStyles.myTrickCaption}>TRICKS</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  opponentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  oppPanel: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  oppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  oppName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  oppScore: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
});
