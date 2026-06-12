import React, { useState } from 'react';
import { HomeScreen, GameType } from './src/screens/HomeScreen';
import { KlondikeGame } from './src/screens/KlondikeGame';
import { MultiplayerLobby } from './src/screens/MultiplayerLobby';
import { MultiplayerGame } from './src/screens/MultiplayerGame';
import { SevenEightGame } from './src/screens/SevenEightGame';
import { FiveThreeTwoGame } from './src/screens/FiveThreeTwoGame';

const App = () => {
  const [activeGame, setActiveGame] = useState<GameType | 'home' | 'multiplayer-game' | 'seven-eight-game' | 'five-three-two-game' | 'seven-eight-lobby' | 'five-three-two-lobby'>('home');
  const [multiplayerConfig, setMultiplayerConfig] = useState<{ seed: string, opponentName: string, isHost: boolean, players: string[], myPlayerName: string, gameMode?: string } | null>(null);

  if (activeGame === 'home') {
    return <HomeScreen onSelectGame={setActiveGame} />;
  }

  if (activeGame === 'klondike') {
    return <KlondikeGame onGoBack={() => setActiveGame('home')} />;
  }

  if (activeGame === 'multiplayer-lobby' || activeGame === 'seven-eight-lobby' || activeGame === 'five-three-two-lobby') {
    let gameNameDisplay = 'Showdown';
    if (activeGame === 'seven-eight-lobby') gameNameDisplay = '7-8 (Saat-Aath)';
    if (activeGame === 'five-three-two-lobby') gameNameDisplay = '5-3-2 (Teen Do Paanch)';

    return (
      <MultiplayerLobby
        gameName={gameNameDisplay}
        onGoBack={() => setActiveGame('home')}
        onGameStart={(seed, opponentName, isHost, players, myPlayerName) => {
          setMultiplayerConfig({ seed, opponentName, isHost, players, myPlayerName, gameMode: activeGame });
          if (activeGame === 'seven-eight-lobby') setActiveGame('seven-eight-game');
          else if (activeGame === 'five-three-two-lobby') setActiveGame('five-three-two-game');
          else setActiveGame('multiplayer-game');
        }}
      />
    );
  }

  if (activeGame === 'multiplayer-game' && multiplayerConfig) {
    return (
      <MultiplayerGame
        onGoBack={() => {
          setMultiplayerConfig(null);
          setActiveGame('home');
        }}
        seed={multiplayerConfig.seed}
        opponentName={multiplayerConfig.opponentName}
        isHost={multiplayerConfig.isHost}
      />
    );
  }

  if (activeGame === 'seven-eight-game' && multiplayerConfig) {
    return (
      <SevenEightGame
        onGoBack={() => {
          setMultiplayerConfig(null);
          setActiveGame('home');
        }}
        seed={multiplayerConfig.seed}
        opponentName={multiplayerConfig.opponentName}
        isHost={multiplayerConfig.isHost}
      />
    );
  }

  if (activeGame === 'five-three-two-game' && multiplayerConfig) {
    return (
      <FiveThreeTwoGame
        onGoBack={() => {
          setMultiplayerConfig(null);
          setActiveGame('home');
        }}
        seed={multiplayerConfig.seed}
        players={multiplayerConfig.players}
        myPlayerName={multiplayerConfig.myPlayerName}
      />
    );
  }

  return null;
};

export default App;
