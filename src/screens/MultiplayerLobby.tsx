import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { socketManager } from '../utils/socketManager';
import NetInfo from '@react-native-community/netinfo';
import { GameLayout } from '../components/game/GameLayout';

interface MultiplayerLobbyProps {
  gameName?: string;
  onGoBack: () => void;
  onGameStart: (seed: string, opponentName: string, isHost: boolean, players: string[], myPlayerName: string) => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ gameName = 'Showdown', onGoBack, onGameStart }) => {
  const [mode, setMode] = useState<'SELECT' | 'HOST' | 'JOIN'>('SELECT');
  const [myIp, setMyIp] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  // Track up to 8 players. Index 0 is the host.
  const [players, setPlayers] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.details && 'ipAddress' in state.details) {
        setMyIp(state.details.ipAddress as string);
      }
    });
  }, []);

  useEffect(() => {
    const handleGameStarted = (data: any) => {
      // For simplicity in a 2+ player game where a single 'opponent' string is passed,
      // we might just join the names of the other players, or pass the full list.
      // Currently, onGameStart accepts a single opponentName.
      const otherPlayers = data.players.filter((p: string) => p !== playerName);
      onGameStart(data.seed, otherPlayers.join(', ') || 'Opponents', mode === 'HOST', data.players, playerName);
    };

    const handlePlayerJoined = (data: any) => {
      if (mode === 'HOST') {
        // Add new player to list and broadcast updated list to everyone
        setPlayers(prev => {
          const newPlayers = [...prev, data.name];
          socketManager.send('UPDATE_PLAYERS', { players: newPlayers });
          return newPlayers;
        });
      }
    };

    const handleUpdatePlayers = (data: any) => {
      if (mode === 'JOIN') {
        setPlayers(data.players);
      }
    };

    socketManager.on('GAME_STARTED', handleGameStarted);
    socketManager.on('PLAYER_JOINED', handlePlayerJoined);
    socketManager.on('UPDATE_PLAYERS', handleUpdatePlayers);

    return () => {
      socketManager.off('GAME_STARTED', handleGameStarted);
      socketManager.off('PLAYER_JOINED', handlePlayerJoined);
      socketManager.off('UPDATE_PLAYERS', handleUpdatePlayers);
    };
  }, [onGameStart, mode, playerName]);

  const hostGame = async () => {
    if (!playerName) return Alert.alert('Error', 'Please enter your name');
    
    setMode('HOST');
    setIsConnecting(true);
    setPlayers([playerName]);

    try {
      const code = await socketManager.createMatchmakingRoom(myIp || 'web-client');
      setRoomCode(code);

      socketManager.hostGame(
        () => setIsConnecting(false),
        () => {}, // Client connects, wait for them to send PLAYER_JOINED
        (err) => {
          Alert.alert('Host Error', err.message || 'Failed to start host server.');
          cancelAndGoBack();
        }
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
      cancelAndGoBack();
    }
  };

  const joinGame = async () => {
    if (!playerName || !joinCode) return Alert.alert('Error', 'Please enter your name and a Room Code');
    
    setIsConnecting(true);
    try {
      const hostIp = await socketManager.resolveRoomCode(joinCode);
      
      socketManager.joinGame(
        hostIp,
        () => {
          setIsConnecting(false);
          setIsConnected(true);
          // Tell host we joined
          socketManager.send('PLAYER_JOINED', { name: playerName });
        },
        (_err) => {
          setIsConnecting(false);
          Alert.alert('Connection Failed', 'Could not connect to host. Make sure you are on the same WiFi.');
        }
      );
    } catch (e: any) {
      setIsConnecting(false);
      Alert.alert('Error', e.message);
    }
  };

  const startGame = () => {
    const isThreePlayer = gameName === '5-3-2 (Teen Do Paanch)';
    const requiredPlayers = isThreePlayer ? 3 : 2;

    if (players.length < requiredPlayers) {
      return Alert.alert('Wait', `You need exactly ${requiredPlayers} players to start this game.`);
    }
    if (isThreePlayer && players.length > 3) {
      return Alert.alert('Wait', 'You have too many players for 5-3-2. Maximum is 3.');
    }

    const seed = Math.random().toString(36).substring(7);
    socketManager.send('GAME_STARTED', { seed, players });
    
    const otherPlayers = players.filter(p => p !== playerName);
    onGameStart(seed, otherPlayers.join(', '), true, players, playerName);
  };

  const cancelAndGoBack = () => {
    socketManager.disconnect();
    if (mode !== 'SELECT') {
      setMode('SELECT');
      setIsConnected(false);
      setPlayers([]);
      setRoomCode('');
      setJoinCode('');
      setIsConnecting(false);
    } else {
      onGoBack();
    }
  };

  return (
    <GameLayout
      title="Multiplayer"
      onBack={cancelAndGoBack}
      backgroundColor="#0F172A"
      showGlow={false}
    >
      <View style={styles.formCard}>
        {mode === 'SELECT' && (
          <>
            <Text style={styles.label}>Your Name</Text>
            <TextInput style={styles.input} value={playerName} onChangeText={setPlayerName} placeholder="Enter your name" placeholderTextColor="#6B7280" />
            
            <TouchableOpacity style={styles.primaryBtn} onPress={hostGame}>
              <Icon name="satellite-dish" size={16} color="#FFF" />
              <Text style={styles.btnText}>Create Room</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
              if (!playerName) return Alert.alert('Error', 'Please enter your name first');
              setMode('JOIN');
            }}>
              <Icon name="link" size={16} color="#FFF" />
              <Text style={styles.btnText}>Join Room</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'HOST' && (
          <View style={{ alignItems: 'center' }}>
            {isConnecting ? (
              <>
                <ActivityIndicator size="large" color="#A78BFA" style={{ marginBottom: 20 }} />
                <Text style={styles.lobbyTitle}>Generating Room Code...</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>ROOM CODE</Text>
                <View style={styles.roomCodeContainer}>
                  <Text style={styles.roomCodeText}>{roomCode}</Text>
                </View>
                
                <Text style={styles.playerCountText}>{players.length}/8 Players Joined</Text>
                
                <View style={styles.playerList}>
                  {players.map((p, idx) => (
                    <View key={idx} style={styles.playerRow}>
                      <Icon name={idx === 0 ? "crown" : "user-circle"} size={20} color={idx === 0 ? "#FBBF24" : "#9CA3AF"} solid />
                      <Text style={styles.playerName}>{p}</Text>
                    </View>
                  ))}
                  {players.length < 8 && (
                    <View style={[styles.playerRow, { borderStyle: 'dashed', backgroundColor: 'transparent', borderColor: '#4B5563', borderWidth: 2 }]}>
                      <ActivityIndicator size="small" color="#6B7280" />
                      <Text style={[styles.playerName, { color: '#6B7280' }]}>Waiting for players...</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.primaryBtn, 
                    { width: '100%', opacity: (gameName === '5-3-2 (Teen Do Paanch)' ? players.length !== 3 : players.length < 2) ? 0.5 : 1 }
                  ]} 
                  onPress={startGame}
                >
                  <Text style={styles.btnText}>Start Game</Text>
                  <Icon name="play" size={16} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {mode === 'JOIN' && !isConnected && (
          <>
            <Text style={styles.label}>Enter Room Code</Text>
            <TextInput 
              style={[styles.input, styles.codeInput]} 
              value={joinCode} 
              onChangeText={setJoinCode} 
              placeholder="XXXXXX" 
              placeholderTextColor="#6B7280" 
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={joinGame} disabled={isConnecting}>
              {isConnecting ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={styles.btnText}>Connect & Join</Text>
                  <Icon name="arrow-right" size={16} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {mode === 'JOIN' && isConnected && (
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Text style={styles.lobbyTitle}>You're in!</Text>
            <Text style={styles.playerCountText}>{players.length}/8 Players Joined</Text>
            
            <View style={styles.playerList}>
              {players.map((p, idx) => (
                <View key={idx} style={styles.playerRow}>
                  <Icon name={idx === 0 ? "crown" : "user-circle"} size={20} color={idx === 0 ? "#FBBF24" : "#9CA3AF"} solid />
                  <Text style={styles.playerName}>{p}</Text>
                </View>
              ))}
            </View>

            <View style={styles.waitingBadge}>
              <ActivityIndicator size="small" color="#34D399" />
              <Text style={styles.readyText}>Waiting for Host to start...</Text>
            </View>
          </View>
        )}
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  formCard: { backgroundColor: 'rgba(30, 41, 59, 0.8)', marginHorizontal: 20, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 15, elevation: 8, marginTop: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  codeInput: { fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: '900', color: '#38BDF8' },
  primaryBtn: { backgroundColor: '#8B5CF6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 32, gap: 10, shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  lobbyTitle: { fontSize: 26, color: '#F8FAFC', fontWeight: '900', marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  
  roomCodeContainer: { backgroundColor: '#0F172A', paddingVertical: 20, paddingHorizontal: 32, borderRadius: 16, marginBottom: 24, borderWidth: 2, borderColor: 'rgba(56, 189, 248, 0.3)', shadowColor: '#38BDF8', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
  roomCodeText: { fontSize: 44, fontWeight: '900', color: '#38BDF8', letterSpacing: 12, textAlign: 'center', textShadowColor: 'rgba(56, 189, 248, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  
  playerCountText: { color: '#94A3B8', fontSize: 14, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  playerList: { width: '100%', marginBottom: 16, gap: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 14, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  playerName: { fontSize: 16, color: '#F8FAFC', fontWeight: '700' },
  
  waitingBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20, marginTop: 24, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.3)' },
  readyText: { color: '#34D399', fontSize: 15, fontWeight: '800' },
});
