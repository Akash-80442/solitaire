import wave, math, struct, random, os

os.makedirs('android/app/src/main/res/raw', exist_ok=True)

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

# Draw: white noise + quick sweep
def draw_func(i, sr, d):
    env = math.exp(-i/(sr*0.04))
    return random.uniform(-0.5, 0.5) * env

# Drop: soft thud
def drop_func(i, sr, d):
    env = math.exp(-i/(sr*0.02))
    freq = 150.0 - 100.0 * (i/(d*sr))
    return math.sin(2.0*math.pi*freq*(i/sr)) * env * 0.8

# Foundation: double chime
def foundation_func(i, sr, d):
    env = math.exp(-i/(sr*0.1))
    v1 = math.sin(2.0*math.pi*880.0*(i/sr))
    v2 = math.sin(2.0*math.pi*1320.0*(i/sr)) * 0.5
    return (v1 + v2) * 0.5 * env

# Error: harsh saw/square
def error_func(i, sr, d):
    env = 1.0 if i < (d*sr*0.8) else math.exp(-(i - d*sr*0.8)/(sr*0.01))
    return (1.0 if math.sin(2.0*math.pi*150.0*(i/sr)) > 0 else -1.0) * 0.3 * env

make_wav('card_draw.wav', 0.15, draw_func)
make_wav('card_drop.wav', 0.1, drop_func)
make_wav('card_foundation.wav', 0.4, foundation_func)
make_wav('error.wav', 0.2, error_func)
