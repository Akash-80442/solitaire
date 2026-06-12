import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Orientation from 'react-native-orientation-locker';

export type GameType = 'klondike' | 'spider' | 'pyramid' | 'multiplayer-lobby' | 'seven-eight-lobby' | 'five-three-two-lobby';

interface HomeScreenProps {
  onSelectGame: (game: GameType) => void;
}

const GAMES = [
  {
    id: 'klondike' as GameType,
    name: 'Klondike',
    icon: 'crown',
    description: 'The classic Solitaire experience.',
    color: '#FBBF24',
    available: true,
  },
  {
    id: 'multiplayer-lobby' as GameType,
    name: 'Showdown',
    icon: 'wifi',
    description: 'Local WiFi Multiplayer! Race an opponent on the exact same deck.',
    color: '#EC4899',
    available: true,
  },
  {
    id: 'seven-eight-lobby' as GameType,
    name: '7-8 (Saat-Aath)',
    icon: 'star',
    description: 'The classic Indian 2-player trick-taking game. Local WiFi.',
    color: '#10B981',
    available: true,
  },
  {
    id: 'five-three-two-lobby' as GameType,
    name: '5-3-2 (Teen Do Paanch)',
    icon: 'users',
    description: 'The beloved 3-player trick-taking game. Requires exactly 3 players.',
    color: '#8B5CF6',
    available: true,
  },
  {
    id: 'spider' as GameType,
    name: 'Spider',
    icon: 'spider',
    description: 'Build descending sequences using two full decks.',
    color: '#A78BFA',
    available: false,
  },
  {
    id: 'pyramid' as GameType,
    name: 'Pyramid',
    icon: 'mountain',
    description: 'Pair cards that add up to 13 to clear the pyramid.',
    color: '#F472B6',
    available: false,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectGame }) => {
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background Glows */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.header}>
        <Icon name="layer-group" size={32} color="#06B6D4" solid />
        <Text style={styles.headerTitle}>Solitaire Collection</Text>
        <Text style={styles.headerSubtitle}>Select a game to play</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, !game.available && { opacity: 0.6 }]}
              onPress={() => game.available && onSelectGame(game.id)}
              disabled={!game.available}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${game.color}20` }]}>
                <Icon name={game.icon} size={28} color={game.color} solid />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameName}>{game.name}</Text>
                {!game.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>SOON</Text>
                  </View>
                )}
                {game.available && (
                  <Text style={styles.gameDescription} numberOfLines={2}>
                    {game.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
  },
  bgGlowTop: {
    position: 'absolute', top: -100, left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute', bottom: -80, right: -100,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gameCard: {
    width: '47%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 6,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    textAlign: 'center',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
