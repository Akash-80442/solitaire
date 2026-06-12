import wave, math, struct, os

def make_wav(name, duration, func):
    sr = 44100.0
    obj = wave.open('android/app/src/main/res/raw/' + name, 'w')
    obj.setnchannels(1)
    obj.setsampwidth(2)
    obj.setframerate(sr)
    frames = b''
    for i in range(int(duration*sr)):
        val = func(i, sr, duration)
        val = max(-1.0, min(1.0, val)) # clamp
        frames += struct.pack('<h', int(32767.0 * val))
    obj.writeframesraw(frames)
    obj.close()

def hint_func(i, sr, d):
    env = math.exp(-i/(sr*0.05))
    return math.sin(2.0*math.pi*1200.0*(i/sr)) * env * 0.4

def win_func(i, sr, d):
    t = i / sr
    env = math.exp(-t/0.5)
    freq = 261.63
    if t > 0.15: freq = 329.63
    if t > 0.3: freq = 392.00
    if t > 0.45: freq = 523.25
    return math.sin(2.0*math.pi*freq*t) * env * 0.5

make_wav('hint.wav', 0.15, hint_func)
make_wav('win.wav', 2.0, win_func)
