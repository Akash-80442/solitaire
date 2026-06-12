import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Vibration, Alert } from 'react-native';
import { Suit, Card, Location, Difficulty } from '../types';
import { createDeck, shuffleArray } from '../utils/deckUtils';

type FreeCellState = {
  freeCells: (Card | null)[];
  foundations: { [key in Suit]: Card[] };
  tableaus: Card[][];
  score: number;
};

export const useFreeCell = () => {
  const [freeCells, setFreeCells] = useState<(Card | null)[]>([null, null, null, null]);
  const [foundations, setFoundations] = useState<{ [key in Suit]: Card[] }>({ spades: [], hearts: [], diamonds: [], clubs: [] });
  const [tableaus, setTableaus] = useState<Card[][]>(Array(8).fill([]));

  // Professional Features State
  const [history, setHistory] = useState<FreeCellState[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [hintsRemaining, setHintsRemaining] = useState<number | 'Unlimited'>('Unlimited');
  const [undosRemaining, setUndosRemaining] = useState<number | 'Unlimited'>('Unlimited');

  const [hintedCardIds, setHintedCardIds] = useState<string[]>([]);
  const [, setAvailableHints] = useState<{ sourceId: string, targetId: string }[]>([]);
  const [hintIndex, setHintIndex] = useState(0);

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

  const startNewGame = useCallback((newDiff?: Difficulty) => {
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

    let deck = shuffleArray(createDeck());
    const newTableaus: Card[][] = Array.from({ length: 8 }, () => []);

    // FreeCell deals all 52 cards face up. First 4 columns get 7, last 4 get 6.
    for (let i = 0; i < 52; i++) {
      const card = deck.pop()!;
      card.isFaceUp = true;
      newTableaus[i % 8].push(card);
    }

    setFreeCells([null, null, null, null]);
    setFoundations({ spades: [], hearts: [], diamonds: [], clubs: [] });
    setTableaus(newTableaus);

    setHistory([]);
    setMoves(0);
    setTime(0);
    setScore(0);
    setHintedCardIds([]);
    setAvailableHints([]);
    setHintIndex(0);
    setSelectedCardId(null);
    setIsGameActive(true);
  }, [difficulty]);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      freeCells: [...freeCells],
      foundations: {
        spades: [...foundations.spades],
        hearts: [...foundations.hearts],
        diamonds: [...foundations.diamonds],
        clubs: [...foundations.clubs],
      },
      tableaus: tableaus.map(col => [...col]),
      score: score,
    }]);
  }, [freeCells, foundations, tableaus, score]);

  const undo = useCallback(() => {
    if (history.length === 0) {return;}
    if (undosRemaining !== 'Unlimited') {
      if (undosRemaining <= 0) {
        Alert.alert('No Undos Left', 'You have used all your undos.');
        return;
      }
      setUndosRemaining(u => (u as number) - 1);
    }

    const lastState = history[history.length - 1];
    setFreeCells(lastState.freeCells);
    setFoundations(lastState.foundations);
    setTableaus(lastState.tableaus);
    setScore(lastState.score);
    setHistory(prev => prev.slice(0, -1));
    setHintedCardIds([]);
    setAvailableHints([]);
  }, [history, undosRemaining]);

  // Validates a FreeCell move (including supermoves)
  const validateFreeCellMove = useCallback((
    movingCards: Card[],
    target: Location,
    currentFoundations: { [key in Suit]: Card[] },
    currentTableaus: Card[][],
    currentFreeCells: (Card | null)[]
  ): boolean => {
    if (movingCards.length === 0) {return false;}
    const baseCard = movingCards[0];

    // Check if moving stack is valid
    for (let i = 1; i < movingCards.length; i++) {
      if (movingCards[i].color === movingCards[i - 1].color || movingCards[i].rank !== movingCards[i - 1].rank - 1) {
        return false;
      }
    }

    // Capacity Check
    const emptyFC = currentFreeCells.filter(c => c === null).length;
    let emptyT = currentTableaus.filter(t => t.length === 0).length;
    if (target.type === 'tableau' && currentTableaus[target.col].length === 0) {
      emptyT -= 1; // Don't count target as an intermediate empty spot
    }
    const maxMove = (1 + emptyFC) * Math.pow(2, emptyT);
    if (movingCards.length > maxMove) {return false;}

    if (target.type === 'foundation') {
      if (movingCards.length > 1) {return false;}
      const f = currentFoundations[target.suit];
      if (baseCard.suit !== target.suit) {return false;}
      if (f.length === 0) {return baseCard.rank === 1;}
      return baseCard.rank === f[f.length - 1].rank + 1;
    }

    if (target.type === 'freecell') {
      if (movingCards.length > 1) {return false;}
      if (currentFreeCells[target.index] !== null) {return false;}
      return true;
    }

    if (target.type === 'tableau') {
      const t = currentTableaus[target.col];
      if (t.length === 0) {return true;} // Any card can go to empty tableau
      const topCard = t[t.length - 1];
      return baseCard.color !== topCard.color && baseCard.rank === topCard.rank - 1;
    }

    return false;
  }, []);

  const computeHints = useCallback(() => {
    const hints: { sourceId: string, targetId: string }[] = [];
    const cardsToCheck: { card: Card, loc: Location, movingCards: Card[] }[] = [];

    freeCells.forEach((c, i) => {
      if (c) {cardsToCheck.push({ card: c, loc: { type: 'freecell', index: i }, movingCards: [c] });}
    });

    tableaus.forEach((col, colIndex) => {
      if (col.length > 0) {
        // Can move single card
        cardsToCheck.push({ card: col[col.length - 1], loc: { type: 'tableau', col: colIndex, row: col.length - 1 }, movingCards: [col[col.length - 1]] });

        // Find valid stacks
        for (let i = col.length - 2; i >= 0; i--) {
          if (col[i + 1].color !== col[i].color && col[i + 1].rank === col[i].rank - 1) {
             cardsToCheck.push({ card: col[i], loc: { type: 'tableau', col: colIndex, row: i }, movingCards: col.slice(i) });
          } else {
             break;
          }
        }
      }
    });

    for (const check of cardsToCheck) {
      for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
        if (validateFreeCellMove(check.movingCards, { type: 'foundation', suit }, foundations, tableaus, freeCells)) {
          hints.push({ sourceId: check.card.id, targetId: `foundation-${suit}` });
        }
      }
      for (let col = 0; col < 8; col++) {
        if (check.loc.type === 'tableau' && check.loc.col === col) {continue;}
        if (check.loc.type === 'tableau' && tableaus[col].length === 0 && check.loc.row === 0) {continue;}

        if (validateFreeCellMove(check.movingCards, { type: 'tableau', col }, foundations, tableaus, freeCells)) {
          const targetCol = tableaus[col];
          const targetId = targetCol.length > 0 ? targetCol[targetCol.length - 1].id : `empty-tableau-${col}`;
          hints.push({ sourceId: check.card.id, targetId });
        }
      }
      if (check.movingCards.length === 1) {
        for (let i = 0; i < 4; i++) {
          if (freeCells[i] === null) {
            hints.push({ sourceId: check.card.id, targetId: `freecell-${i}` });
            break; // Only suggest one empty freecell to avoid spam
          }
        }
      }
    }
    return hints;
  }, [freeCells, tableaus, foundations, validateFreeCellMove]);

  const getHint = useCallback(() => {
    if (hintsRemaining !== 'Unlimited' && hintsRemaining <= 0) {
      Alert.alert('No Hints Left', 'You have used all your hints.');
      return;
    }

    const newHints = computeHints();
    if (newHints.length === 0) {
      Alert.alert('No Moves Left', 'You are stuck.');
      return;
    }

    const idx = (hintIndex + 1) % newHints.length;
    setAvailableHints(newHints);
    setHintIndex(idx);
    setHintedCardIds([newHints[idx].sourceId, newHints[idx].targetId]);

    if (hintsRemaining !== 'Unlimited') {setHintsRemaining(h => (h as number) - 1);}

    if (soundEnabled) {
      try { require('../utils/audio').playHint(); } catch(e){}
    }
  }, [hintsRemaining, hintIndex, computeHints, soundEnabled]);

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
    let bestLoc: Location | null = null;
    let minDist = Infinity;
    for (const [id, box] of Object.entries(dropZones.current)) {
      const centerX = box.x + box.w / 2;
      

      let dist = Infinity;
      if (id.startsWith('foundation-') || id.startsWith('freecell-')) {
        if (pageY >= box.y - 40 && pageY <= box.y + box.h + 80) {
          dist = Math.abs(pageX - centerX);
        }
      } else if (id.startsWith('tableau-')) {
        dist = Math.abs(pageX - centerX);
      }

      if (dist < minDist && dist < box.w * 1.5) {
        minDist = dist;
        if (id.startsWith('foundation-')) {bestLoc = { type: 'foundation', suit: id.split('-')[1] as Suit };}
        else if (id.startsWith('freecell-')) {bestLoc = { type: 'freecell', index: parseInt(id.split('-')[1]) };}
        else if (id.startsWith('tableau-')) {bestLoc = { type: 'tableau', col: parseInt(id.split('-')[1]) };}
      }
    }
    return bestLoc;
  }, []);

  const executeMove = useCallback((source: Location, target: Location, movingCards: Card[]) => {
    saveHistory();
    setHintedCardIds([]);
    setAvailableHints([]);
    setMoves(m => m + 1);

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

    // Remove from source
    if (source.type === 'freecell') {
      setFreeCells(prev => {
        const n = [...prev];
        n[source.index] = null;
        return n;
      });
    } else if (source.type === 'foundation') {
      setFoundations(prev => ({ ...prev, [source.suit]: prev[source.suit].slice(0, -1) }));
    } else if (source.type === 'tableau' && source.row !== undefined) {
      setTableaus(prev => {
        const newT = [...prev];
        newT[source.col] = prev[source.col].slice(0, source.row);
        return newT;
      });
    }

    // Add to target
    if (target.type === 'freecell') {
      setFreeCells(prev => {
        const n = [...prev];
        n[target.index] = movingCards[0];
        return n;
      });
    } else if (target.type === 'foundation') {
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
    if (sourceLoc.type === 'freecell') {movingCards = [freeCells[sourceLoc.index]!];}
    else if (sourceLoc.type === 'foundation') {movingCards = [foundations[sourceLoc.suit][foundations[sourceLoc.suit].length - 1]];}
    else if (sourceLoc.type === 'tableau' && sourceLoc.row !== undefined) {movingCards = tableaus[sourceLoc.col].slice(sourceLoc.row);}

    if (validateFreeCellMove(movingCards, targetLoc, foundations, tableaus, freeCells)) {
      executeMove(sourceLoc, targetLoc, movingCards);
      return true;
    }
    return false;
  }, [freeCells, foundations, tableaus, evaluateDrop, executeMove, validateFreeCellMove]);

  const handleLocationTap = useCallback((targetLoc: Location) => {
    if (!selectedCardId) {
      let cardToSelect: Card | null = null;
      if (targetLoc.type === 'freecell') {cardToSelect = freeCells[targetLoc.index];}
      else if (targetLoc.type === 'tableau' && targetLoc.row !== undefined) {cardToSelect = tableaus[targetLoc.col][targetLoc.row];}
      else if (targetLoc.type === 'foundation' && foundations[targetLoc.suit].length > 0) {cardToSelect = foundations[targetLoc.suit][foundations[targetLoc.suit].length - 1];}

      if (cardToSelect) {setSelectedCardId(cardToSelect.id);}
      return;
    }

    let sourceLoc: Location | null = null;
    let movingCards: Card[] = [];

    const fcIndex = freeCells.findIndex(c => c?.id === selectedCardId);
    if (fcIndex !== -1) {
      sourceLoc = { type: 'freecell', index: fcIndex };
      movingCards = [freeCells[fcIndex]!];
    } else {
      for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
        const f = foundations[suit];
        if (f.length > 0 && f[f.length - 1].id === selectedCardId) {
          sourceLoc = { type: 'foundation', suit };
          movingCards = [f[f.length - 1]];
        }
      }
      if (!sourceLoc) {
        for (let col = 0; col < 8; col++) {
          const row = tableaus[col].findIndex(c => c.id === selectedCardId);
          if (row !== -1) {
            sourceLoc = { type: 'tableau', col, row };
            movingCards = tableaus[col].slice(row);
            break;
          }
        }
      }
    }

    if (!sourceLoc || (sourceLoc.type === targetLoc.type && (sourceLoc as any).col === (targetLoc as any).col && (sourceLoc as any).index === (targetLoc as any).index)) {
      setSelectedCardId(null);
      return;
    }

    if (validateFreeCellMove(movingCards, targetLoc, foundations, tableaus, freeCells)) {
      executeMove(sourceLoc, targetLoc, movingCards);
      setSelectedCardId(null);
    } else {
      handleError();
      setSelectedCardId(null);
    }
  }, [selectedCardId, freeCells, foundations, tableaus, executeMove, handleError, validateFreeCellMove]);

  return {
    freeCells,
    foundations,
    tableaus,
    startNewGame,
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
