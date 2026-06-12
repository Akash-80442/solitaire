import wave, math, struct, random

def drop_func(i, sr, d):
    # A sharp "snap" or "click" for dropping a card
    # Mixed high-frequency click and brief noise sweep
    t = i / sr
    env = math.exp(-t / 0.015)
    noise = random.uniform(-1, 1) * 0.3
    # 800Hz sine for the click body
    click = math.sin(2.0 * math.pi * 800.0 * t) * 0.7
    return (click + noise) * env

sr = 44100.0
duration = 0.1
obj = wave.open('android/app/src/main/res/raw/card_drop.wav', 'w')
obj.setnchannels(1)
obj.setsampwidth(2)
obj.setframerate(sr)
frames = b''
for i in range(int(duration*sr)):
    val = drop_func(i, sr, duration)
    val = max(-1.0, min(1.0, val))
    frames += struct.pack('<h', int(32767.0 * val))
obj.writeframesraw(frames)
obj.close()
