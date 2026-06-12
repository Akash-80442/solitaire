import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { IconButton } from './IconButton';
import { COLORS } from '../../constants/theme';

interface TopHeaderProps {
  title: string;
  onBack: () => void;
  rightActions?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, onBack, rightActions }) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <IconButton name="chevron-left" onPress={onBack} size={18} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {rightActions}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: COLORS.textLight,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
