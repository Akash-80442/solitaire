import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { PremiumModal } from '../ui/PremiumModal';
import { PremiumButton } from '../ui/PremiumButton';
import { SegmentedControl } from '../ui/SegmentedControl';

export interface GameSettings {
  cardStyle?: 'modern' | 'classic';
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

interface GameSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdate: (key: keyof GameSettings, value: any) => void;
  showSound?: boolean;
  showVibration?: boolean;
  showCardStyle?: boolean;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdate,
  showSound = false,
  showVibration = false,
  showCardStyle = true,
}) => {
  return (
    <PremiumModal
      visible={visible}
      title="Settings"
      icon="cog"
      onClose={onClose}
    >
      {showCardStyle && (
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Card Design</Text>
          <SegmentedControl
            segments={[
              { label: 'Modern', value: 'modern' },
              { label: 'Classic', value: 'classic' },
            ]}
            selectedValue={settings.cardStyle || 'modern'}
            onValueChange={(val) => onUpdate('cardStyle', val)}
            style={{ width: 140 }}
          />
        </View>
      )}

      {showSound && (
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Sound Effects</Text>
          <Switch
            value={settings.soundEnabled || false}
            onValueChange={(val) => onUpdate('soundEnabled', val)}
            trackColor={{ true: '#10B981', false: '#6B7280' }}
          />
        </View>
      )}

      {showVibration && (
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Haptic Feedback</Text>
          <Switch
            value={settings.vibrationEnabled || false}
            onValueChange={(val) => onUpdate('vibrationEnabled', val)}
            trackColor={{ true: '#10B981', false: '#6B7280' }}
          />
        </View>
      )}

      <PremiumButton title="Done" onPress={onClose} style={{ marginTop: 16 }} />
    </PremiumModal>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  settingText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
