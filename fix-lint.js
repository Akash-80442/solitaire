const fs = require('fs');

function replace(file, find, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(find, replace);
  fs.writeFileSync(file, content);
}

replace('src/components/AnimatedHandCard.tsx', 
  ']}, [c.id]);', 
  '] // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [c.id]);');

replace('src/components/DraggableStack.tsx', 
  'import { StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions } from \'react-native\';', 
  'import { StyleSheet, Animated, PanResponder } from \'react-native\';');

replace('src/hooks/useFreeCell.ts',
  'const _centerY = box.y + box.h / 2;',
  '');

replace('src/screens/MultiplayerGame.tsx',
  'export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ onGoBack, seed, opponentName, isHost }) => {',
  'export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ onGoBack, seed, opponentName, isHost: _isHost }) => {');

replace('src/screens/MultiplayerGame.tsx',
  '}, [score, foundations, onGoBack]);',
  '} // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [score, foundations, onGoBack, opponentName]);');

replace('src/screens/MultiplayerLobby.tsx',
  '} catch (err) {',
  '} catch (_err) {');

console.log('Fixed');
