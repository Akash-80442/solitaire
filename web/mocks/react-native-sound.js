export default class Sound {
  constructor(url, basePath, onError) {
    this.url = url;
    // On the web we might use HTMLAudioElement later if needed
    // For now, it's just a mock to prevent crashes.
    if (onError) setTimeout(() => onError(null), 0);
  }
  
  play(cb) {
    if (cb) cb(true);
  }
  
  stop() {
    return this;
  }
  
  release() {}
  
  setVolume() {
    return this;
  }
  
  setNumberOfLoops() {
    return this;
  }
}

Sound.setCategory = () => {};
Sound.MAIN_BUNDLE = '';
