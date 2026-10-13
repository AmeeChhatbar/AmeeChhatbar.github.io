import { useEffect, useEffectEvent } from 'react'

// ── CATALOG ───────────────────────────────────────────────────────────────────
export const GAMES: [string, string][] = [
  ['snake', 'classic snake — arrows / WASD'],
  ['2048', 'slide & merge tiles to reach 2048'],
  ['hangman', 'guess the tech word letter by letter'],
  ['typing', 'typing speed test (WPM)'],
  ['guess', 'find the secret number from 1–100'],
  ['rps', 'rock · paper · scissors vs the CPU'],
]

// ── HELPERS ───────────────────────────────────────────────────────────────────
export type Dir = 'up' | 'down' | 'left' | 'right'
export const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down',
  ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
}
export const rnd = (n: number) => Math.floor(Math.random() * n)
export const pick = <T,>(xs: readonly T[]) => xs[rnd(xs.length)]

// ── HIGH SCORES (per browser, best effort) ────────────────────────────────────
const BEST_KEY = 'amee-terminal-best'
function readBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}') } catch { return {} }
}
export const getBest = (game: string) => readBest()[game] ?? 0
export function saveBest(game: string, score: number) {
  const all = readBest()
  if (score <= (all[game] ?? 0)) return
  try { localStorage.setItem(BEST_KEY, JSON.stringify({ ...all, [game]: score })) } catch { /* storage unavailable */ }
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────────
// Captures keys on window before anything else (so Escape doesn't close the modal mid-game).
export function useGameKeys(handler: (key: string) => void) {
  const onKey = useEffectEvent(handler)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault(); e.stopImmediatePropagation()
      onKey(e.key.length === 1 ? e.key.toLowerCase() : e.key)
    }
    window.addEventListener('keydown', h, true)
    return () => window.removeEventListener('keydown', h, true)
  }, [])
}
