import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { seStyles as styles } from '../../constants/SevenEightStyles';

interface OpponentPanelProps {
  opponentName: string;
  isHost: boolean;
  tricks: number;
}

export const OpponentPanel: React.FC<OpponentPanelProps> = ({ opponentName, isHost, tricks }) => (
  <View style={styles.opponentArea}>
    <View style={styles.playerPanel}>
      <View style={styles.playerIdentity}>
        <View style={styles.avatarCircle}>
          <Icon name="user-astronaut" size={18} color="#475569" />
        </View>
        <View style={styles.playerMeta}>
          <Text style={styles.playerName} numberOfLines={1}>{opponentName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{isHost ? 'NON-DEALER' : 'DEALER'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.trickCounter}>
        <Text style={styles.trickBig}>{tricks}</Text>
        <Text style={styles.trickOf}>/{isHost ? 8 : 7}</Text>
        <Text style={styles.trickCaption}>TRICKS</Text>
      </View>
    </View>
  </View>
);

interface MyInfoBarProps {
  isHost: boolean;
  tricks: number;
  targetTricks: number;
}

export const MyInfoBar: React.FC<MyInfoBarProps> = ({ isHost, tricks, targetTricks }) => (
  <View style={styles.myInfoBar}>
    <View style={styles.playerIdentity}>
      <View style={[styles.avatarCircle, styles.myAvatarCircle]}>
        <Icon name="user" size={16} color="#10B981" />
      </View>
      <View style={styles.playerMeta}>
        <Text style={styles.myPlayerName}>You</Text>
        <View style={[styles.roleBadge, styles.myRoleBadge]}>
          <Text style={[styles.roleText, styles.myRoleText]}>
            {isHost ? 'DEALER' : 'NON-DEALER'}
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.myTrickCounter}>
      <Text style={styles.myTrickBig}>{tricks}</Text>
      <Text style={styles.myTrickOf}>/{targetTricks}</Text>
      <Text style={styles.myTrickCaption}>TRICKS</Text>
    </View>
  </View>
);
