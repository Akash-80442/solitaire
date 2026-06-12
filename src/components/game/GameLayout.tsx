import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { TopHeader } from '../ui/TopHeader';

interface GameLayoutProps {
  title: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
  backgroundColor?: string;
  showGlow?: boolean;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  title,
  onBack,
  rightActions,
  children,
  backgroundColor = '#0F172A',
  showGlow = true,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} hidden={showGlow} />

      {showGlow && (
        <>
          <View style={styles.bgGlowTop} />
          <View style={styles.bgGlowBottom} />
        </>
      )}

      {onBack && (
        <TopHeader
          title={title}
          onBack={onBack}
          rightActions={rightActions}
        />
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
  },
  bgGlowTop: {
    position: 'absolute', top: -100, left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  bgGlowBottom: {
    position: 'absolute', bottom: -80, right: -100,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
});
