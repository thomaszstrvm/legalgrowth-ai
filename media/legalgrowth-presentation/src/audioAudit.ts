// Development-only observation of the real Web Audio scheduler. No second player,
// no mock clock and no replacement audio. Only enabled by ?playbackQA=1.
type ScheduledChunk = {
  when: number;
  offset: number;
  duration: number;
  rate: number;
  sampleRate: number;
  fingerprint: number[];
};
export const audioAudit = {
  contexts: [] as AudioContext[],
  chunks: [] as ScheduledChunk[],
};
let installed = false;
export const installAudioAudit = () => {
  if (
    installed ||
    typeof window === "undefined" ||
    !new URLSearchParams(window.location.search).has("playbackQA")
  )
    return;
  installed = true;
  const original = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (
    when = 0,
    offset = 0,
    duration?: number,
  ) {
    // Observe only buffers in the composition's own page; preserve all arguments.
    const context = this.context as AudioContext;
    if (!audioAudit.contexts.includes(context))
      audioAudit.contexts.push(context);
    if (this.buffer)
      audioAudit.chunks.push({
        when,
        offset,
        duration: duration ?? this.buffer.duration - offset,
        rate: this.playbackRate.value,
        sampleRate: this.buffer.sampleRate,
        fingerprint: Array.from(this.buffer.getChannelData(0).subarray(0, 24)),
      });
    if (duration === undefined) original.call(this, when, offset);
    else original.call(this, when, offset, duration);
  };
};
