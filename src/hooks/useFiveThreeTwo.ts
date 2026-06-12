import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Suit } from '../types';
import { createDeck, shuffleArraySeeded } from '../utils/deckUtils';
import { playDraw, playFoundation, playError } from '../utils/audio';

export type GamePhase = 'DEALING' | 'TRUMP_SELECTION' | 'PLAYING' | 'TRICK_RESOLUTION' | 'GAME_OVER';

// Generate the 30-card deck
const createFiveThreeTwoDeck = (): Card[] => {
  const fullDeck = createDeck();
  return fullDeck.filter(c => {
    if (c.rank >= 8 || c.rank === 1) {return true;} // 8, 9, 10, J, Q, K, A
    if (c.rank === 7 && (c.suit === 'hearts' || c.suit === 'spades')) {return true;} // 7 of Hearts, 7 of Spades
    return false;
  });
};

const getRankValue = (rank: number) => {
  if (rank === 1) {return 14;} // Ace is highest
  return rank;
};

export const useFiveThreeTwo = (seed: string, players: string[], myPlayerName: string, onSendEvent: (type: string, data: any) => void) => {
  const [phase, setPhase] = useState<GamePhase>('DEALING');
  const [trumpSuit, setTrumpSuit] = useState<Suit | null>(null);

  const [myHand, setMyHand] = useState<Card[]>([]);
  
  // Track opponent hands by their player name
  const [oppHands, setOppHands] = useState<Record<string, Card[]>>({});

  // The cards currently played in the center
  const [playedCards, setPlayedCards] = useState<Record<string, Card | null>>({});

  // Tricks won by each player
  const [tricksWon, setTricksWon] = useState<Record<string, number>>({});

  const [ledSuit, setLedSuit] = useState<Suit | null>(null);
  const [trickWinner, setTrickWinner] = useState<string | null>(null);

  const myPlayerIndex = players.indexOf(myPlayerName);
  
  // Roles:
  // Player 0: Dealer (Target 2)
  // Player 1: Chooses Trump (Target 5), Leads first trick
  // Player 2: Third (Target 3)
  
  const getTargetTricks = (index: number) => {
    if (index === 0) return 2;
    if (index === 1) return 5;
    return 3;
  };

  const myTarget = getTargetTricks(myPlayerIndex);
  
  // Who's turn is it?
  const [turnIndex, setTurnIndex] = useState<number>(1); // Player 1 starts the game (Trump selector)
  const isMyTurn = turnIndex === myPlayerIndex;

  const isTrumpSelector = myPlayerIndex === 1;

  // Refs for synchronous access in socket callbacks
  const playedCardsRef = useRef<Record<string, Card | null>>({});
  const turnIndexRef = useRef<number>(1);
  const totalTricksRef = useRef<number>(0);
  const ledSuitRef = useRef<Suit | null>(null);
  const firstPlayerOfTrickRef = useRef<number>(1);

  const setPlayedCardsSafe = useCallback((cards: Record<string, Card | null>) => {
    playedCardsRef.current = cards;
    setPlayedCards(cards);
  }, []);

  const setTurnIndexSafe = useCallback((turn: number) => {
    turnIndexRef.current = turn;
    setTurnIndex(turn);
  }, []);

  // Initialize deck
  useEffect(() => {
    setPhase('DEALING');
    setTrumpSuit(null);
    setMyHand([]);
    
    const initialOppHands: Record<string, Card[]> = {};
    const initialPlayed: Record<string, Card | null> = {};
    const initialTricks: Record<string, number> = {};
    
    players.forEach(p => {
      initialOppHands[p] = [];
      initialPlayed[p] = null;
      initialTricks[p] = 0;
    });
    
    setOppHands(initialOppHands);
    setPlayedCardsSafe(initialPlayed);
    setTricksWon(initialTricks);
    setTurnIndexSafe(1);
    firstPlayerOfTrickRef.current = 1;
    setLedSuit(null);

    totalTricksRef.current = 0;
    ledSuitRef.current = null;

    const deck = shuffleArraySeeded(createFiveThreeTwoDeck(), seed);

    // Deal Phase 1 (5 cards each)
    const handsPhase1: Record<string, Card[]> = {};
    const handsPhase2: Record<string, Card[]> = {};
    
    players.forEach((p, index) => {
      handsPhase1[p] = deck.slice(index * 5, (index + 1) * 5).map(c => ({...c, isFaceUp: true}));
      handsPhase2[p] = deck.slice(15 + (index * 5), 15 + ((index + 1) * 5)).map(c => ({...c, isFaceUp: true}));
    });

    setMyHand(handsPhase1[myPlayerName]);
    
    const initialOppHandsUpdate: Record<string, Card[]> = {};
    players.forEach(p => {
      if (p !== myPlayerName) {
        initialOppHandsUpdate[p] = handsPhase1[p];
      }
    });
    setOppHands(initialOppHandsUpdate);

    setPhase('TRUMP_SELECTION');

    // Store full hands for later
    (global as any)._fullHands532 = {};
    players.forEach(p => {
      (global as any)._fullHands532[p] = [...handsPhase1[p], ...handsPhase2[p]];
    });

  }, [seed, players, myPlayerName, setPlayedCardsSafe, setTurnIndexSafe]);

  const commitTrump = useCallback((suit: Suit) => {
    setTrumpSuit(suit);
    setPhase('PLAYING');
    
    setMyHand((global as any)._fullHands532[myPlayerName]);
    
    const fullOppHandsUpdate: Record<string, Card[]> = {};
    players.forEach(p => {
      if (p !== myPlayerName) {
        fullOppHandsUpdate[p] = (global as any)._fullHands532[p];
      }
    });
    setOppHands(fullOppHandsUpdate);

    // Reset trick state
    const initialPlayed: Record<string, Card | null> = {};
    players.forEach(p => initialPlayed[p] = null);
    setPlayedCardsSafe(initialPlayed);
    
    totalTricksRef.current = 0;
    ledSuitRef.current = null;
  }, [players, myPlayerName, setPlayedCardsSafe]);

  const selectTrump = useCallback((suit: Suit) => {
    if (!isTrumpSelector) return;
    commitTrump(suit);
    onSendEvent('SET_TRUMP', { suit });
  }, [isTrumpSelector, commitTrump, onSendEvent]);

  const handleOpponentSetTrump = useCallback((suit: Suit) => {
    commitTrump(suit);
  }, [commitTrump]);

  const resolveTrick = useCallback((currentPlayedCards: Record<string, Card>) => {
    setPhase('TRICK_RESOLUTION');

    // Determine winner
    let winningPlayer = players[firstPlayerOfTrickRef.current];
    let winningCard = currentPlayedCards[winningPlayer];
    const currentLedSuit = ledSuitRef.current;

    players.forEach(p => {
      if (p === winningPlayer) return;
      const card = currentPlayedCards[p];
      
      const winningCardIsTrump = winningCard.suit === trumpSuit;
      const cardIsTrump = card.suit === trumpSuit;

      if (cardIsTrump && !winningCardIsTrump) {
        winningPlayer = p;
        winningCard = card;
      } else if (cardIsTrump && winningCardIsTrump) {
        if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
          winningPlayer = p;
          winningCard = card;
        }
      } else if (!cardIsTrump && !winningCardIsTrump) {
        if (card.suit === currentLedSuit && winningCard.suit !== currentLedSuit) {
          winningPlayer = p;
          winningCard = card;
        } else if (card.suit === currentLedSuit && winningCard.suit === currentLedSuit) {
          if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
            winningPlayer = p;
            winningCard = card;
          }
        }
      }
    });

    setTrickWinner(winningPlayer);

    setTimeout(() => {
      if (winningPlayer === myPlayerName) {
        playFoundation();
      } else {
        playError();
      }

      setTricksWon(prev => ({
        ...prev,
        [winningPlayer]: prev[winningPlayer] + 1
      }));

      // Next trick starts with winner
      const winnerIndex = players.indexOf(winningPlayer);
      setTurnIndexSafe(winnerIndex);
      firstPlayerOfTrickRef.current = winnerIndex;

      // Reset play area
      const emptyPlayed: Record<string, Card | null> = {};
      players.forEach(p => emptyPlayed[p] = null);
      setPlayedCardsSafe(emptyPlayed);
      setLedSuit(null);
      ledSuitRef.current = null;
      setTrickWinner(null);

      totalTricksRef.current += 1;

      if (totalTricksRef.current >= 10) {
         setPhase('GAME_OVER');
      } else {
         setPhase('PLAYING');
      }
    }, 1500);

  }, [trumpSuit, players, myPlayerName, setPlayedCardsSafe, setTurnIndexSafe]);

  const processCardPlay = useCallback((playerName: string, card: Card, isMe: boolean) => {
    playDraw();

    if (isMe) {
      setMyHand(prev => prev.filter(c => c.id !== card.id));
    } else {
      setOppHands(prev => {
        const newHands = { ...prev };
        newHands[playerName] = newHands[playerName].filter(c => c.id !== card.id);
        return newHands;
      });
    }

    const newPlayedCards = { ...playedCardsRef.current, [playerName]: card };
    setPlayedCardsSafe(newPlayedCards);

    // Count how many cards played in this trick
    const playedCount = Object.values(newPlayedCards).filter(c => c !== null).length;

    if (playedCount === 1) {
      // First card played in trick
      setLedSuit(card.suit);
      ledSuitRef.current = card.suit;
    }

    if (playedCount === 3) {
      // Trick is complete
      resolveTrick(newPlayedCards as Record<string, Card>);
    } else {
      // Move to next player's turn
      const currentPlayerIndex = players.indexOf(playerName);
      const nextPlayerIndex = (currentPlayerIndex + 1) % 3;
      setTurnIndexSafe(nextPlayerIndex);
    }
  }, [players, setPlayedCardsSafe, setTurnIndexSafe, resolveTrick]);

  const playCard = useCallback((cardId: string) => {
    if (!isMyTurn) return;
    if (phase !== 'PLAYING') return;

    const cardIndex = myHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = myHand[cardIndex];

    // Enforce following suit
    if (ledSuitRef.current) {
      const hasLedSuit = myHand.some(c => c.suit === ledSuitRef.current);
      if (hasLedSuit && card.suit !== ledSuitRef.current) {
        playError();
        return; 
      }
    }

    processCardPlay(myPlayerName, card, true);
    onSendEvent('PLAY_CARD', { cardId, playerName: myPlayerName });

  }, [isMyTurn, phase, myHand, myPlayerName, processCardPlay, onSendEvent]);

  const handleOpponentPlay = useCallback((playerName: string, cardId: string) => {
    const fullHand = (global as any)._fullHands532?.[playerName] || [];
    const card = fullHand.find((c: Card) => c.id === cardId);
    if (!card) return;

    processCardPlay(playerName, card, false);
  }, [processCardPlay]);

  return {
    phase,
    trumpSuit,
    myHand,
    oppHands,
    playedCards,
    tricksWon,
    isMyTurn,
    myTarget,
    ledSuit,
    trickWinner,
    isTrumpSelector,
    selectTrump,
    playCard,
    handleOpponentSetTrump,
    handleOpponentPlay,
    getTargetTricks,
  };
};
