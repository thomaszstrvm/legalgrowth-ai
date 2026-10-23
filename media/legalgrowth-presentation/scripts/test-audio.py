"""Verify score synthesis and the two Remotion audio exports (local QA)."""
from pathlib import Path
import importlib.util
import json
import wave
import numpy as np

project=Path(__file__).resolve().parents[1]
root=project.parents[1]
spec=importlib.util.spec_from_file_location("score",project/"scripts/compose-audio.py")
score=importlib.util.module_from_spec(spec)
spec.loader.exec_module(score)

def read(path):
    with wave.open(str(path)) as stream:
        info=(stream.getnframes(),stream.getframerate(),stream.getnchannels(),stream.getsampwidth())
        samples=np.frombuffer(stream.readframes(stream.getnframes()),dtype="<i2").reshape(-1,2)
    return info,samples

def main():
    audio=project/"public/audio"
    meta,master=read(audio/"legalgrowth-original.wav")
    assert meta==(960000,48000,2,2)
    _,music=read(audio/"music-stem.wav")
    _,effects=read(audio/"effects-stem.wav")
    assert np.max(np.abs(master.astype(float)-music.astype(float)-effects.astype(float)))<=1
    assert np.max(np.abs(master.astype(float)))<32767
    assert np.all(master[0]==0) and np.all(master[-1]==0)
    a,b=score.compose();a2,b2=score.compose()
    assert np.array_equal(a,a2) and np.array_equal(b,b2)
    assert np.max(np.abs(np.round((a+b)*32767).astype('<i2').astype(float)-master.astype(float)))==0
    target=np.zeros((10,2));score.place(target,np.ones(20),-5/score.RATE)
    assert np.allclose(target,2**-.5)
    original=target.copy();score.place(target,np.ones(3),99);assert np.array_equal(target,original)
    for values,pan in [(np.array([float('nan')]),0),(np.ones(3),2)]:
        try:score.place(target,values,0,pan)
        except ValueError:pass
        else:raise AssertionError('Invalid sound accepted')
    stereo_rms=np.sqrt(np.mean(master.astype(float)**2))
    mono_rms=np.sqrt(np.mean(master.astype(float).mean(axis=1)**2))
    loss=float(20*np.log10(mono_rms/stereo_rms))
    assert loss > -6,'Excessive cancellation in mono'
    result={'duration_seconds':20,'sample_rate':48000,'channels':2,'no_sample_clipping':True,'silent_endpoints':True,'deterministic_synthesis':True,'stems_recombine_within_one_pcm_unit':True,'boundary_and_invalid_input_tests':'passed','mono_level_change_db':loss}
    renders=root/'output/remotion-audio-v2'
    if (renders/'light.wav').exists() and (renders/'dark.wav').exists():
        lm,light=read(renders/'light.wav');dm,dark=read(renders/'dark.wav')
        assert lm==dm==meta and np.array_equal(light,dark)
        assert np.max(np.abs(light.astype(float)-master.astype(float)))<=1
        result['remotion_exports']='20s, identical PCM in both themes, master within one PCM unit'
    else:result['remotion_exports']='not checked; run the WAV render commands in docs/AUDIO-SCORE.md'
    result['limitations']=['No listening review','No LUFS/true peak: bundled FFmpeg lacks ebur128','Known Zod version warning retained']
    renders.mkdir(parents=True,exist_ok=True)
    (renders/'validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result))

if __name__=='__main__':main()
