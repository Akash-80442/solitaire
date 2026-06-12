import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Vibration, Alert } from 'react-native';
import { Suit, Card, Location, Difficulty } from '../types';
import { createDeck, shuffleArray, shuffleArraySeeded } from '../utils/deckUtils';
import { validateMove } from '../utils/gameLogic';

type GameState = {
  stock: Card[];
  waste: Card[];
  foundations: { [key in Suit]: Card[] };
  tableaus: Card[][];
  score: number;
};

export const useSolitaire = () => {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<{ [key in Suit]: Card[] }>({ spades: [], hearts: [], diamonds: [], clubs: [] });
  const [tableaus, setTableaus] = useState<Card[][]>(Array(7).fill([]));

  // Professional Features State
  const [history, setHistory] = useState<GameState[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [hintsRemaining, setHintsRemaining] = useState<number | 'Unlimited'>('Unlimited');
  const [undosRemaining, setUndosRemaining] = useState<number | 'Unlimited'>('Unlimited');

  const [hintedCardIds, setHintedCardIds] = useState<string[]>([]);
  const [availableHints, setAvailableHints] = useState<{ sourceId: string, targetId: string }[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [consecutiveHints, setConsecutiveHints] = useState(0);

  const [isGameActive, setIsGameActive] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [cardStyle, setCardStyle] = useState<'classic' | 'modern'>('modern');

  const handleError = useCallback(() => {
    if (vibrationEnabled) {Vibration.vibrate(50);}
    if (soundEnabled) {
      try {
        const audio = require('../utils/audio');
        if (audio && audio.playError) {audio.playError();}
      } catch (e) {}
    }
  }, [vibrationEnabled, soundEnabled]);

  const dropZones = useRef<Record<string, { x: number, y: number, w: number, h: number }>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const startNewGame = useCallback((newDiff?: Difficulty, seed?: string) => {
    const d = newDiff || difficulty;
    setDifficulty(d);
    if (d === 'Easy') {
      setHintsRemaining('Unlimited');
      setUndosRemaining('Unlimited');
    } else if (d === 'Medium') {
      setHintsRemaining(5);
      setUndosRemaining(5);
    } else if (d === 'Hard') {
      setHintsRemaining(0);
      setUndosRemaining(1);
    }

    let deck = seed ? shuffleArraySeeded(createDeck(), seed) : shuffleArray(createDeck());
    const newTableaus: Card[][] = Array.from({ length: 7 }, () => []);

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.pop()!;
        if (row === col) {card.isFaceUp = true;}
        newTableaus[col].push(card);
      }
    }

    setStock(deck);
    setWaste([]);
    setFoundations({ spades: [], hearts: [], diamonds: [], clubs: [] });
    setTableaus(newTableaus);

    setHistory([]);
    setMoves(0);
    setTime(0);
    setScore(0);
    setHintedCardIds([]);
    setAvailableHints([]);
    setHintIndex(0);
    setConsecutiveHints(0);
    setSelectedCardId(null);
    setIsGameActive(true);
  }, [difficulty]);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      stock: [...stock],
      waste: [...waste],
      foundations: {
        spades: [...foundations.spades],
        hearts: [...foundations.hearts],
        diamonds: [...foundations.diamonds],
        clubs: [...foundations.clubs],
      },
      tableaus: tableaus.map(col => [...col]),
      score: score,
    }]);
  }, [stock, waste, foundations, tableaus, score]);

  const undo = useCallback(() => {
    if (history.length === 0) {return;}
    if (undosRemaining !== 'Unlimited') {
      if (undosRemaining <= 0) {
        Alert.alert('No Undos Left', 'You have used all your undos for this difficulty.');
        return;
      }
      setUndosRemaining(u => (u as number) - 1);
    }

    const lastState = history[history.length - 1];
    setStock(lastState.stock);
    setWaste(lastState.waste);
    setFoundations(lastState.foundations);
    setTableaus(lastState.tableaus);
    setScore(lastState.score);
    setHistory(prev => prev.slice(0, -1));
    setHintedCardIds([]);
    setAvailableHints([]);
    setConsecutiveHints(0);
  }, [history, undosRemaining]);

  const computeHints = useCallback(() => {
    const hints: { sourceId: string, targetId: string }[] = [];
    const cardsToCheck: { card: Card, loc: Location, movingCards: Card[] }[] = [];

    if (waste.length > 0) {
      cardsToCheck.push({ card: waste[waste.length - 1], loc: { type: 'waste' }, movingCards: [waste[waste.length - 1]] });
    }

    tableaus.forEach((col, colIndex) => {
      const faceUpIndex = col.findIndex(c => c.isFaceUp);
      if (faceUpIndex !== -1) {
        const topCard = col[col.length - 1];
        cardsToCheck.push({ card: topCard, loc: { type: 'tableau', col: colIndex, row: col.length - 1 }, movingCards: [topCard] });

        if (col.length - 1 > faceUpIndex) {
          const stackBase = col[faceUpIndex];
          cardsToCheck.push({ card: stackBase, loc: { type: 'tableau', col: colIndex, row: faceUpIndex }, movingCards: col.slice(faceUpIndex) });
        }
      }
    });

    for (const check of cardsToCheck) {
      for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
        if (validateMove(check.movingCards, { type: 'foundation', suit }, foundations, tableaus)) {
          hints.push({ sourceId: check.card.id, targetId: `foundation-${suit}` });
        }
      }
      for (let col = 0; col < 7; col++) {
        if (check.loc.type === 'tableau' && check.loc.col === col) {continue;}
        if (check.loc.type === 'tableau' && tableaus[col].length === 0 && check.loc.row === 0) {continue;}

        if (validateMove(check.movingCards, { type: 'tableau', col }, foundations, tableaus)) {
          const targetCol = tableaus[col];
          const targetId = targetCol.length > 0 ? targetCol[targetCol.length - 1].id : `empty-tableau-${col}`;
          hints.push({ sourceId: check.card.id, targetId });
        }
      }
    }
    return hints;
  }, [waste, tableaus, foundations]);

  const getHint = useCallback(() => {
    if (hintsRemaining !== 'Unlimited' && hintsRemaining <= 0) {
      Alert.alert('No Hints Left', 'You have used all your hints for this difficulty.');
      return;
    }

    let currentHints = availableHints;
    let idx = hintIndex;

    // Recompute hints if state changed (we simply recompute every time to be safe)
    const newHints = computeHints();
    if (newHints.length === 0) {
      // No moves on board. Check if we can draw.
      if (stock.length > 0 || waste.length > 0) {
        setHintedCardIds(['stock']);
        if (soundEnabled) { try { require('../utils/audio').playHint(); } catch(e){} }
      } else {
        Alert.alert('No Moves Left', 'There are no possible moves remaining.');
      }
      setConsecutiveHints(0);
      return;
    }

    // Compare new hints to cached
    if (newHints.length !== currentHints.length || !newHints.every((h, i) => h.sourceId === currentHints[i]?.sourceId && h.targetId === currentHints[i]?.targetId)) {
      currentHints = newHints;
      idx = 0;
      setAvailableHints(newHints);
      setConsecutiveHints(0);
    } else {
      idx = (idx + 1) % currentHints.length;
      setConsecutiveHints(c => c + 1);
    }

    if (consecutiveHints >= 3) {
      Alert.alert('Try drawing', 'You might want to draw a new card from the stock deck.');
      setHintedCardIds(['stock']);
      setConsecutiveHints(0);
      return;
    }

    setHintIndex(idx);
    setHintedCardIds([currentHints[idx].sourceId, currentHints[idx].targetId]);

    if (hintsRemaining !== 'Unlimited') {setHintsRemaining(h => (h as number) - 1);}

    if (soundEnabled) {
      try { require('../utils/audio').playHint(); } catch(e){}
    }
  }, [hintsRemaining, availableHints, hintIndex, computeHints, stock.length, waste.length, soundEnabled, consecutiveHints]);

  const measureZone = useCallback((id: string) => (ref: View | null) => {
    if (ref) {
      setTimeout(() => {
        ref.measure((x, y, w, h, px, py) => {
          dropZones.current[id] = { x: px, y: py, w, h };
        });
      }, 500);
    }
  }, []);

  const evaluateDrop = useCallback((pageX: number, pageY: number): Location | null => {
    let bestFoundation: Location | null = null;
    let minFDist = Infinity;
    for (const [id, box] of Object.entries(dropZones.current)) {
      if (id.startsWith('foundation-')) {
        if (pageY >= box.y - 40 && pageY <= box.y + box.h + 80) {
          const centerX = box.x + box.w / 2;
          const dist = Math.abs(pageX - centerX);
          if (dist < minFDist && dist < box.w) {
            minFDist = dist;
            bestFoundation = { type: 'foundation', suit: id.split('-')[1] as Suit };
          }
        }
      }
    }
    if (bestFoundation) {return bestFoundation;}

    let bestTableau: Location | null = null;
    let minTDist = Infinity;
    for (const [id, box] of Object.entries(dropZones.current)) {
      if (id.startsWith('tableau-')) {
        const centerX = box.x + box.w / 2;
        const dist = Math.abs(pageX - centerX);
        if (dist < minTDist && dist < box.w * 1.5) {
          minTDist = dist;
          bestTableau = { type: 'tableau', col: parseInt(id.split('-')[1]) };
        }
      }
    }
    if (bestTableau) {return bestTableau;}

    return null;
  }, []);

  const handleStockPress = useCallback(() => {
    saveHistory();
    setHintedCardIds([]);
    setAvailableHints([]);
    setConsecutiveHints(0);
    setMoves(m => m + 1);

    if (soundEnabled) {
      try {
        const audio = require('../utils/audio');
        if (audio && audio.playDraw) {audio.playDraw();}
      } catch (e) {}
    }

    if (stock.length === 0) {
      if (waste.length === 0) {
        setMoves(m => m - 1);
        setHistory(prev => prev.slice(0, -1));
        return;
      }
      setStock(waste.map(c => ({ ...c, isFaceUp: false })).reverse());
      setWaste([]);
      setScore(s => Math.max(0, s - 100)); // Recycling penalty
    } else {
      const drawCount = difficulty === 'Hard' ? 3 : 1;
      const drawnCards = stock.slice(-drawCount).reverse();
      setStock(stock.slice(0, -drawCount));
      setWaste([...waste, ...drawnCards.map(c => ({ ...c, isFaceUp: true }))]);
    }
  }, [stock, waste, saveHistory, soundEnabled, difficulty]);

  const executeMove = useCallback((source: Location, target: Location, movingCards: Card[]) => {
    saveHistory();
    setHintedCardIds([]);
    setAvailableHints([]);
    setConsecutiveHints(0);
    setMoves(m => m + 1);

    // Scoring
    if (source.type === 'waste' && target.type === 'tableau') {setScore(s => s + 5);}
    if (source.type === 'waste' && target.type === 'foundation') {setScore(s => s + 10);}
    if (source.type === 'tableau' && target.type === 'foundation') {setScore(s => s + 10);}
    if (source.type === 'foundation' && target.type === 'tableau') {setScore(s => Math.max(0, s - 15));}

    if (soundEnabled) {
      try {
        const audio = require('../utils/audio');
        if (target.type === 'foundation') {
          if (audio && audio.playFoundation) {audio.playFoundation();}
        } else {
          if (audio && audio.playDrop) {audio.playDrop();}
        }
      } catch (e) {}
    }

    if (source.type === 'waste') {
      setWaste(prev => prev.slice(0, -movingCards.length));
    } else if (source.type === 'foundation') {
      setFoundations(prev => ({ ...prev, [source.suit]: prev[source.suit].slice(0, -1) }));
    } else if (source.type === 'tableau' && source.row !== undefined) {
      setTableaus(prev => {
        const newT = [...prev];
        const col = [...newT[source.col]];
        col.splice(source.row!, movingCards.length);
        if (col.length > 0 && !col[col.length - 1].isFaceUp) {
          col[col.length - 1] = { ...col[col.length - 1], isFaceUp: true };
        }
        newT[source.col] = col;
        return newT;
      });
    }

    if (target.type === 'foundation') {
      setFoundations(prev => {
        const nextState = { ...prev, [target.suit]: [...prev[target.suit], ...movingCards] };
        const totalCards = Object.values(nextState).reduce((acc, f) => acc + f.length, 0);
        if (totalCards === 52) {
          setIsGameActive(false);
          if (soundEnabled) {
            try { require('../utils/audio').playWin(); } catch(e){}
          }
        }
        return nextState;
      });
    } else if (target.type === 'tableau') {
      setTableaus(prev => {
        const newT = [...prev];
        newT[target.col] = [...newT[target.col], ...movingCards];
        return newT;
      });
    }
  }, [saveHistory, soundEnabled]);

  const handleDrop = useCallback((sourceLoc: Location, pageX: number, pageY: number): boolean => {
    const targetLoc = evaluateDrop(pageX, pageY);
    if (!targetLoc) {return false;}

    let movingCards: Card[] = [];
    if (sourceLoc.type === 'waste') {movingCards = [waste[waste.length - 1]];}
    else if (sourceLoc.type === 'foundation') {movingCards = [foundations[sourceLoc.suit][foundations[sourceLoc.suit].length - 1]];}
    else if (sourceLoc.type === 'tableau' && sourceLoc.row !== undefined) {movingCards = tableaus[sourceLoc.col].slice(sourceLoc.row);}

    if (validateMove(movingCards, targetLoc, foundations, tableaus)) {
      executeMove(sourceLoc, targetLoc, movingCards);
      return true;
    }
    return false;
  }, [waste, foundations, tableaus, evaluateDrop, executeMove]);

  const handleLocationTap = useCallback((targetLoc: Location) => {
    if (!selectedCardId) {
      let cardToSelect: Card | null = null;
      if (targetLoc.type === 'waste' && waste.length > 0) {cardToSelect = waste[waste.length - 1];}
      else if (targetLoc.type === 'tableau' && targetLoc.row !== undefined) {cardToSelect = tableaus[targetLoc.col][targetLoc.row];}
      else if (targetLoc.type === 'foundation' && foundations[targetLoc.suit].length > 0) {cardToSelect = foundations[targetLoc.suit][foundations[targetLoc.suit].length - 1];}

      if (cardToSelect && cardToSelect.isFaceUp) {setSelectedCardId(cardToSelect.id);}
      return;
    }

    let sourceLoc: Location | null = null;
    let movingCards: Card[] = [];

    if (waste.length > 0 && waste[waste.length - 1].id === selectedCardId) {
      sourceLoc = { type: 'waste' };
      movingCards = [waste[waste.length - 1]];
    } else {
      for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
        const f = foundations[suit];
        if (f.length > 0 && f[f.length - 1].id === selectedCardId) {
          sourceLoc = { type: 'foundation', suit };
          movingCards = [f[f.length - 1]];
        }
      }
      if (!sourceLoc) {
        for (let col = 0; col < 7; col++) {
          const row = tableaus[col].findIndex(c => c.id === selectedCardId);
          if (row !== -1) {
            sourceLoc = { type: 'tableau', col, row };
            movingCards = tableaus[col].slice(row);
            break;
          }
        }
      }
    }

    if (!sourceLoc || (sourceLoc.type === targetLoc.type && (sourceLoc as any).col === (targetLoc as any).col)) {
      setSelectedCardId(null);
      return;
    }

    if (validateMove(movingCards, targetLoc, foundations, tableaus)) {
      executeMove(sourceLoc, targetLoc, movingCards);
      setSelectedCardId(null);
    } else {
      handleError();
      setSelectedCardId(null);
    }
  }, [selectedCardId, waste, foundations, tableaus, executeMove, handleError]);

  return {
    stock,
    waste,
    foundations,
    tableaus,
    startNewGame,
    handleStockPress,
    handleDrop,
    measureZone,
    history,
    undo,
    moves,
    time,
    score,
    difficulty,
    hintsRemaining,
    undosRemaining,
    hintedCardIds,
    getHint,
    selectedCardId,
    handleLocationTap,
    handleError,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    cardStyle,
    setCardStyle,
  };
};
