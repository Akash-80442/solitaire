import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let drawLoaded = false;
let dropLoaded = false;
let foundationLoaded = false;
let errorLoaded = false;
let hintLoaded = false;
let winLoaded = false;

const drawSound = new Sound('card_draw.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {drawLoaded = true;}
});

const dropSound = new Sound('card_drop.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {dropLoaded = true;}
});

const foundationSound = new Sound('card_foundation.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {foundationLoaded = true;}
});

const errorSound = new Sound('error.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {errorLoaded = true;}
});

const hintSound = new Sound('hint.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {hintLoaded = true;}
});

const winSound = new Sound('win.wav', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {winLoaded = true;}
});

export const playDraw = () => {
  if (drawLoaded) {drawSound.play();}
};

export const playDrop = () => {
  if (dropLoaded) {dropSound.play();}
};

export const playFoundation = () => {
  if (foundationLoaded) {foundationSound.play();}
};

export const playError = () => {
  if (errorLoaded) {errorSound.play();}
};

export const playHint = () => {
  if (hintLoaded) {hintSound.play();}
};

export const playWin = () => {
  if (winLoaded) {winSound.play();}
};
