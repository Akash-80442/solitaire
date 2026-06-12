import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Suit } from '../types';
import { createDeck, shuffleArraySeeded } from '../utils/deckUtils';
import { playDraw, playFoundation, playError } from '../utils/audio';

export type GamePhase = 'DEALING' | 'TRUMP_SELECTION' | 'PLAYING' | 'TRICK_RESOLUTION' | 'GAME_OVER';

// Generate the 30-card deck
const createSevenEightDeck = (): Card[] => {
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

export const useSevenEight = (seed: string, isDealer: boolean, onSendEvent: (type: string, data: any) => void) => {
  const [phase, setPhase] = useState<GamePhase>('DEALING');
  const [trumpSuit, setTrumpSuit] = useState<Suit | null>(null);

  const [myHand, setMyHand] = useState<Card[]>([]);
  const [oppHand, setOppHand] = useState<Card[]>([]); // We keep track locally since deterministic

  const [myPlay, setMyPlay] = useState<Card | null>(null);
  const [oppPlay, setOppPlay] = useState<Card | null>(null);

  const [myTricks, setMyTricks] = useState(0);
  const [oppTricks, setOppTricks] = useState(0);

  const [isMyTurn, setIsMyTurn] = useState(!isDealer); // Non-dealer starts the first trick
  const [ledSuit, setLedSuit] = useState<Suit | null>(null);

  const [trickWinner, setTrickWinner] = useState<'me' | 'opponent' | null>(null);

  const targetTricks = isDealer ? 7 : 8;

  // Refs for synchronous access in socket callbacks
  const myPlayRef = useRef<Card | null>(null);
  const oppPlayRef = useRef<Card | null>(null);
  const isMyTurnRef = useRef<boolean>(!isDealer);
  const totalTricksRef = useRef<number>(0);
  const ledSuitRef = useRef<Suit | null>(null);

  const setMyPlaySafe = useCallback((card: Card | null) => {
    myPlayRef.current = card;
    setMyPlay(card);
  }, []);

  const setOppPlaySafe = useCallback((card: Card | null) => {
    oppPlayRef.current = card;
    setOppPlay(card);
  }, []);

  const setIsMyTurnSafe = useCallback((turn: boolean) => {
    isMyTurnRef.current = turn;
    setIsMyTurn(turn);
  }, []);

  // Initialize deck
  useEffect(() => {
    // Reset state for new round
    setPhase('DEALING');
    setTrumpSuit(null);
    setMyPlay(null);
    setOppPlay(null);
    setMyTricks(0);
    setOppTricks(0);
    setIsMyTurn(!isDealer);
    setLedSuit(null);

    myPlayRef.current = null;
    oppPlayRef.current = null;
    isMyTurnRef.current = !isDealer;
    totalTricksRef.current = 0;
    ledSuitRef.current = null;

    const deck = shuffleArraySeeded(createSevenEightDeck(), seed);

    // Deal 1: 5 cards each
    const dealerCards = deck.slice(0, 5).map(c => ({...c, isFaceUp: true}));
    const nonDealerCards = deck.slice(5, 10).map(c => ({...c, isFaceUp: true}));

    // Deal 2: 10 cards each (after trump selection)
    const dealerCards2 = deck.slice(10, 20).map(c => ({...c, isFaceUp: true}));
    const nonDealerCards2 = deck.slice(20, 30).map(c => ({...c, isFaceUp: true}));

    if (isDealer) {
      setMyHand(dealerCards);
      setOppHand(nonDealerCards);
    } else {
      setMyHand(nonDealerCards);
      setOppHand(dealerCards);
    }

    setPhase('TRUMP_SELECTION');

    // Store full hands for later
    (global as any)._fullMyHand = isDealer ? [...dealerCards, ...dealerCards2] : [...nonDealerCards, ...nonDealerCards2];
    (global as any)._fullOppHand = isDealer ? [...nonDealerCards, ...nonDealerCards2] : [...dealerCards, ...dealerCards2];

  }, [seed, isDealer]);

  const selectTrump = useCallback((suit: Suit) => {
    if (isDealer) {return;} // Only non-dealer selects trump
    setTrumpSuit(suit);
    setPhase('PLAYING');
    setMyHand((global as any)._fullMyHand);
    setOppHand((global as any)._fullOppHand);

    // Reset refs on new game
    myPlayRef.current = null;
    oppPlayRef.current = null;
    totalTricksRef.current = 0;
    ledSuitRef.current = null;

    onSendEvent('SET_TRUMP', { suit });
  }, [isDealer, onSendEvent]);

  const handleOpponentSetTrump = useCallback((suit: Suit) => {
    setTrumpSuit(suit);
    setPhase('PLAYING');
    setMyHand((global as any)._fullMyHand);
    setOppHand((global as any)._fullOppHand);

    myPlayRef.current = null;
    oppPlayRef.current = null;
    totalTricksRef.current = 0;
    ledSuitRef.current = null;
  }, []);

  const resolveTrick = useCallback((myCard: Card, oppCard: Card) => {
    setPhase('TRICK_RESOLUTION');

    let iWin = false;
    const currentLedSuit = ledSuitRef.current;
    const myCardIsTrump = myCard.suit === trumpSuit;
    const oppCardIsTrump = oppCard.suit === trumpSuit;

    if (myCardIsTrump && oppCardIsTrump) {
      iWin = getRankValue(myCard.rank) > getRankValue(oppCard.rank);
    } else if (myCardIsTrump && !oppCardIsTrump) {
      iWin = true;
    } else if (!myCardIsTrump && oppCardIsTrump) {
      iWin = false;
    } else {
      if (myCard.suit === currentLedSuit && oppCard.suit === currentLedSuit) {
         iWin = getRankValue(myCard.rank) > getRankValue(oppCard.rank);
      } else if (myCard.suit === currentLedSuit) {
         iWin = true;
      } else if (oppCard.suit === currentLedSuit) {
         iWin = false;
      } else {
         iWin = false;
      }
    }

    setTrickWinner(iWin ? 'me' : 'opponent');

    setTimeout(() => {
      if (iWin) {
        setMyTricks(t => t + 1);
        setIsMyTurnSafe(true);
        playFoundation();
      } else {
        setOppTricks(t => t + 1);
        setIsMyTurnSafe(false);
        playError();
      }

      setMyPlaySafe(null);
      setOppPlaySafe(null);
      setLedSuit(null);
      ledSuitRef.current = null;
      setTrickWinner(null);

      totalTricksRef.current += 1;

      if (totalTricksRef.current >= 15) {
         setPhase('GAME_OVER');
      } else {
         setPhase('PLAYING');
      }
    }, 1500);

  }, [trumpSuit, setMyPlaySafe, setOppPlaySafe, setIsMyTurnSafe]);

  const playCard = useCallback((cardId: string) => {
    if (!isMyTurnRef.current && !oppPlayRef.current) {return;} // Not my turn to lead, and opponent hasn't played
    if (phase !== 'PLAYING') {return;}

    const cardIndex = myHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {return;}

    const card = myHand[cardIndex];

    // Enforce following suit if opponent led
    if (oppPlayRef.current && ledSuitRef.current) {
      const hasLedSuit = myHand.some(c => c.suit === ledSuitRef.current);
      if (hasLedSuit && card.suit !== ledSuitRef.current) {
        // Invalid play!
        playError();
        return; // Reject play
      }
    }

    playDraw();

    const newHand = [...myHand];
    newHand.splice(cardIndex, 1);
    setMyHand(newHand);
    setMyPlaySafe(card);

    onSendEvent('PLAY_CARD', { cardId });

    if (oppPlayRef.current) {
      // I am playing second. Trick is complete!
      resolveTrick(card, oppPlayRef.current);
    } else {
      // I am leading the trick
      setLedSuit(card.suit);
      ledSuitRef.current = card.suit;
      setIsMyTurnSafe(false); // Wait for opponent
    }
  }, [myHand, phase, onSendEvent, resolveTrick, setMyPlaySafe, setIsMyTurnSafe]);

  const handleOpponentPlay = useCallback((cardId: string) => {
    const cardIndex = oppHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {return;}

    const card = oppHand[cardIndex];
    playDraw();

    const newOppHand = [...oppHand];
    newOppHand.splice(cardIndex, 1);
    setOppHand(newOppHand);
    setOppPlaySafe(card);

    if (myPlayRef.current) {
      // Opponent is playing second. Trick is complete.
      resolveTrick(myPlayRef.current, card);
    } else {
      // Opponent is leading
      setLedSuit(card.suit);
      ledSuitRef.current = card.suit;
      setIsMyTurnSafe(true);
    }
  }, [oppHand, resolveTrick, setOppPlaySafe, setIsMyTurnSafe]);

  return {
    phase,
    trumpSuit,
    myHand,
    oppHandCount: oppHand.length,
    myPlay,
    oppPlay,
    myTricks,
    oppTricks,
    isMyTurn,
    targetTricks,
    ledSuit,
    trickWinner,
    selectTrump,
    playCard,
    handleOpponentSetTrump,
    handleOpponentPlay,
  };
};
