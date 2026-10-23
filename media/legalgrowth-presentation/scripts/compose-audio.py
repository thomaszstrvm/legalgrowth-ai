"""Original deterministic score, no samples or external music. MIT project license.
48 kHz stereo; five cues align with the five scene cuts. Run with Python + NumPy.
"""
from pathlib import Path
import json, wave
import numpy as np
RATE=48000
DURATION=20
rng=np.random.default_rng(20261023)
track=np.zeros((RATE*DURATION,2),dtype=np.float64)
def add(signal,at,pan=0):
    start=round(at*RATE); count=min(len(signal),len(track)-start)
    if count<=0:return
    track[start:start+count,0]+=signal[:count]*np.sqrt((1-pan)/2)
    track[start:start+count,1]+=signal[:count]*np.sqrt((1+pan)/2)
def note(midi):return 440*2**((midi-69)/12)
def pad(notes,at,duration):
    t=np.arange(int((duration+.6)*RATE))/RATE
    env=np.minimum(t/.55,1)*np.minimum((t[-1]-t)/.7,1)
    for i,midi in enumerate(notes):
        freq=note(midi)
        tone=(np.sin(2*np.pi*freq*t)+.19*np.sin(2*np.pi*freq*2*t)+.12*np.sin(2*np.pi*freq*.998*t))
        add(tone*env*.038,at,(i-1.5)/4)
def pluck(midi,at,gain=.08,pan=0):
    t=np.arange(int(1.8*RATE))/RATE; freq=note(midi)
    env=(1-np.exp(-t*80))*np.exp(-t*3.1)
    s=(np.sin(2*np.pi*freq*t)+.22*np.sin(2*np.pi*freq*2*t))*env*gain
    add(s,at,pan);add(s*.25,at+.21,-pan)
cues=[(0,3,[53,60,64,67]),(3,4,[50,57,60,64]),(7,4,[46,53,57,60]),(11,5,[48,55,60,62]),(16,4,[53,60,65,67])]
for at,length,chord in cues:
    pad(chord,at,length)
    pluck(chord[0],at,.15)
    for n in range(int(length*2)):
        pluck(chord[1+n%3]+12,at+n*.5,.035 if at<7 else .052,(-1)**n*.35)
    if at:
        t=np.arange(int(.55*RATE))/RATE
        # Soft filtered air cue reaches its maximum at each cut; seeded noise.
        raw=rng.normal(0,1,len(t)); filtered=np.convolve(raw,np.ones(31)/31,mode='same')
        add(filtered*np.sin(np.pi*t/.55)**2*.18,at-.28)
# Final resolved interval has space to decay without clipping the last frame.
pluck(77,16.15,.10,-.2);pluck(79,16.65,.06,.2)
fade=np.minimum(np.arange(len(track))/(RATE*.08),1)*np.minimum((len(track)-1-np.arange(len(track)))/(RATE*1.1),1)
track*=fade[:,None]
peak=float(np.max(np.abs(track)));track*=.67/max(peak,1e-9)
out=Path(__file__).resolve().parents[1]/'public/audio';out.mkdir(exist_ok=True)
with wave.open(str(out/'legalgrowth-original.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((track*32767).astype('<i2').tobytes())
(out/'provenance.json').write_text(json.dumps({'origin':'Original offline synthesis by project script, no sampled or downloaded audio','license':'MIT, same as project','sample_rate':RATE,'samples_per_channel':len(track),'duration_seconds':DURATION,'peak_dbfs':float(20*np.log10(np.max(np.abs(track)))),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(track**2)))),'cue_seconds':[0,3,7,11,16],'seed':20261023},indent=2))
print('Original 20-second stereo score generated:',out)
