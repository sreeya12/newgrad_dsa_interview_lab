import { useState, useEffect } from 'react'

// The tape: a list of precomputed frames plus a transport (play / step / scrub).
// Every lab builds its frames eagerly in a useMemo, so stepping is pure
// rendering and scrubbing backwards is free.
export function useTape(frames, speed = 780) {
  const [i, setI] = useState(0)
  const [wantPlay, setWantPlay] = useState(false)

  // When the caller swaps in a different frame list (a control changed),
  // rewind. Adjusting state during render is the documented pattern for this -
  // doing it in an effect would render the stale tape for one frame first.
  const [seenFrames, setSeenFrames] = useState(frames)
  if (frames !== seenFrames) {
    setSeenFrames(frames)
    setI(0)
    setWantPlay(false)
  }

  const idx = Math.min(i, frames.length - 1)
  const atEnd = idx >= frames.length - 1
  // Playback stops at the last frame without needing a setState in the effect.
  const playing = wantPlay && !atEnd

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setI((x) => x + 1), speed)
    return () => clearTimeout(t)
  }, [playing, i, speed])

  return {
    i: idx,
    n: frames.length,
    frame: frames[idx] || {},
    playing,
    set: (k) => {
      setWantPlay(false)
      setI(k)
    },
    step: (d) => {
      setWantPlay(false)
      setI((x) => Math.max(0, Math.min(frames.length - 1, x + d)))
    },
    toggle: () => {
      if (atEnd) {
        setI(0)
        setWantPlay(true)
      } else {
        setWantPlay((p) => !p)
      }
    },
    reset: () => {
      setWantPlay(false)
      setI(0)
    },
  }
}
