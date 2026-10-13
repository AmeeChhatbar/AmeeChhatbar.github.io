import { useEffect, useRef, useState } from 'react'
import type { ReactNode, TouchEvent } from 'react'
import { KEY_DIR, getBest, rnd, saveBest, useGameKeys } from './common'
import type { Dir } from './common'

export interface LiveGameProps { onExit: (summary: ReactNode[]) => void }

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const ARROW: Record<Dir, string> = { up: '▲', left: '◀', down: '▼', right: '▶' }

function useSwipe(onDir: (d: Dir) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  return {
    onTouchStart: (e: TouchEvent) => { const t = e.touches[0]; start.current = { x: t.clientX, y: t.clientY } },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current; start.current = null; if (!s) return
      const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
      onDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
    },
  }
}

function Controls({ onDir, actions }: { onDir: (d: Dir) => void; actions: [string, () => void][] }) {
  return (
    <>
      <div className="gm-pad">
        {(['up', 'left', 'down', 'right'] as Dir[]).map(d => <button key={d} className={`gm-pad-${d}`} onClick={() => onDir(d)} aria-label={d}>{ARROW[d]}</button>)}
      </div>
      <div className="gm-actions">
        {actions.map(([label, fn]) => <button key={label} className="gm-btn" onClick={fn}>[{label}]</button>)}
      </div>
    </>
  )
}

function Summary({ name, score, best }: { name: string; score: number; best: number }) {
  const record = score > 0 && score >= best
  return <span><span className="tc-sec">{name}</span><span className="tc-dim"> — </span><span className="tc-val">score <b className="tc-hi">{score}</b></span><span className="tc-dim"> · best {Math.max(score, best)}</span>{record && <span className="gm-ok">  ★ new record!</span>}</span>
}

// ── SNAKE ─────────────────────────────────────────────────────────────────────
const SW = 24, SH = 14
type Pt = [number, number]
const DELTA: Record<Dir, Pt> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const same = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1]

interface SnakeState { body: Pt[]; dir: Dir; queue: Dir[]; food: Pt; score: number; over: boolean; paused: boolean }

function freeCell(body: Pt[]): Pt {
  for (;;) { const p: Pt = [rnd(SW), rnd(SH)]; if (!body.some(b => same(b, p))) return p }
}
function newSnake(): SnakeState {
  const body: Pt[] = [[5, 7], [4, 7], [3, 7]]
  return { body, dir: 'right', queue: [], food: freeCell(body), score: 0, over: false, paused: false }
}
function stepSnake(s: SnakeState): SnakeState {
  if (s.over || s.paused) return s
  const [dir, ...queue] = s.queue.length ? s.queue : [s.dir]
  const head: Pt = [s.body[0][0] + DELTA[dir][0], s.body[0][1] + DELTA[dir][1]]
  const eats = same(head, s.food)
  const body = eats ? s.body : s.body.slice(0, -1)
  if (head[0] < 0 || head[0] >= SW || head[1] < 0 || head[1] >= SH || body.some(p => same(p, head)))
    return { ...s, dir, queue, over: true }
  const next = [head, ...body]
  return { ...s, dir, queue, body: next, food: eats ? freeCell(next) : s.food, score: s.score + (eats ? 1 : 0) }
}

const SNAKE_CELL: Record<string, [string, string]> = {
  '.': ['· ', 'gm-empty'], h: ['██', 'gm-sh'], b: ['▓▓', 'gm-sb'], f: ['██', 'gm-food'], x: ['██', 'gm-dead'],
}

export function Snake({ onExit }: LiveGameProps) {
  const [s, setS] = useState(newSnake)
  const [best, setBest] = useState(() => getBest('snake'))
  const delay = Math.max(60, 130 - s.score * 3)

  useEffect(() => {
    if (s.over || s.paused) return
    const t = window.setInterval(() => setS(stepSnake), delay)
    return () => clearInterval(t)
  }, [delay, s.over, s.paused])
  useEffect(() => { if (s.over) saveBest('snake', s.score) }, [s.over, s.score])

  const turn = (d: Dir) => setS(p => {
    const last = p.queue.at(-1) ?? p.dir
    if (p.over || d === last || d === OPP[last] || p.queue.length >= 3) return p
    return { ...p, queue: [...p.queue, d], paused: false }
  })
  const pause = () => setS(p => p.over ? p : { ...p, paused: !p.paused })
  const restart = () => { setBest(getBest('snake')); setS(newSnake()) }
  const quit = () => { saveBest('snake', s.score); onExit([<Summary name="snake" score={s.score} best={best} />]) }

  useGameKeys(k => {
    if (KEY_DIR[k]) turn(KEY_DIR[k])
    else if (k === ' ' || k === 'p') pause()
    else if (k === 'r') restart()
    else if (k === 'q' || k === 'Escape') quit()
  })
  const swipe = useSwipe(turn)

  const occupied = new Set(s.body.map(p => p.join()))
  const rows: ReactNode[] = []
  for (let y = 0; y < SH; y++) {
    const types: string[] = []
    for (let x = 0; x < SW; x++) {
      const k = `${x},${y}`
      types.push(k === s.body[0].join() ? (s.over ? 'x' : 'h') : occupied.has(k) ? 'b' : same([x, y], s.food) ? 'f' : '.')
    }
    // group runs of the same cell type into one span
    const runs: ReactNode[] = []
    for (let i = 0; i < types.length;) {
      let j = i; while (j < types.length && types[j] === types[i]) j++
      const [ch, cls] = SNAKE_CELL[types[i]]
      runs.push(<span key={i} className={cls}>{ch.repeat(j - i)}</span>); i = j
    }
    rows.push(<div key={y}><span className="gm-wall">│</span>{runs}<span className="gm-wall">│</span></div>)
  }

  return (
    <div className="gm">
      <div className="gm-head"><span className="gm-title">SNAKE</span><span>score <b>{s.score}</b></span><span>best <b>{Math.max(best, s.score)}</b></span>{s.paused && <span className="gm-ok">paused</span>}</div>
      <div className="gm-board" {...swipe}>
        <div className="gm-wall">{'┌' + '─'.repeat(SW * 2) + '┐'}</div>
        {rows}
        <div className="gm-wall">{'└' + '─'.repeat(SW * 2) + '┘'}</div>
      </div>
      <div className={`gm-msg${s.over ? ' bad' : ''}`}>
        {s.over ? `game over — score ${s.score}. press r to restart or q to quit.` : 'arrows / WASD to move · space pause · r restart · q quit'}
      </div>
      <Controls onDir={turn} actions={[['pause', pause], ['restart', restart], ['quit', quit]]} />
    </div>
  )
}

// ── 2048 ──────────────────────────────────────────────────────────────────────
const LINES: Record<Dir, number[][]> = (() => {
  const idx = [0, 1, 2, 3]
  const rows = idx.map(r => idx.map(c => r * 4 + c)), cols = idx.map(c => idx.map(r => r * 4 + c))
  return { left: rows, right: rows.map(l => [...l].reverse()), up: cols, down: cols.map(l => [...l].reverse()) }
})()

function slide(g: number[], dir: Dir) {
  const out = [...g]; let gained = 0
  for (const line of LINES[dir]) {
    const vals = line.map(i => g[i]).filter(Boolean), merged: number[] = []
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) { merged.push(vals[i] * 2); gained += vals[i] * 2; i++ }
      else merged.push(vals[i])
    }
    line.forEach((cell, k) => { out[cell] = merged[k] ?? 0 })
  }
  return { grid: out, gained, moved: out.some((v, i) => v !== g[i]) }
}
function addTile(g: number[]) {
  const empty = g.flatMap((v, i) => v ? [] : [i])
  if (!empty.length) return g
  const n = [...g]; n[empty[rnd(empty.length)]] = Math.random() < 0.9 ? 2 : 4
  return n
}
const canMove = (g: number[]) => (Object.keys(LINES) as Dir[]).some(d => slide(g, d).moved)

interface State2048 { grid: number[]; score: number; over: boolean; won: boolean }
const new2048 = (): State2048 => ({ grid: addTile(addTile(Array(16).fill(0))), score: 0, over: false, won: false })
function move2048(s: State2048, d: Dir): State2048 {
  if (s.over) return s
  const r = slide(s.grid, d)
  if (!r.moved) return s
  const grid = addTile(r.grid)
  return { grid, score: s.score + r.gained, over: !canMove(grid), won: s.won || grid.includes(2048) }
}

const TILE_BG = ['#1b2523', '#203532', '#2b4a3f', '#36624f', '#4ec9b0', '#7fd6c4', '#dcdcaa', '#e5c07b', '#d19a66', '#e06c75', '#e63329']
function tileStyle(v: number) {
  if (!v) return undefined
  const lvl = Math.log2(v) - 1
  return { background: TILE_BG[lvl] ?? '#c586c0', color: lvl >= 4 ? '#0a0a0a' : '#e0e0e0', fontSize: v >= 1024 ? '0.75em' : undefined }
}

export function Game2048({ onExit }: LiveGameProps) {
  const [s, setS] = useState(new2048)
  const [best, setBest] = useState(() => getBest('2048'))
  useEffect(() => { if (s.over) saveBest('2048', s.score) }, [s.over, s.score])

  const move = (d: Dir) => setS(p => move2048(p, d))
  const restart = () => { setBest(getBest('2048')); setS(new2048()) }
  const quit = () => { saveBest('2048', s.score); onExit([<Summary name="2048" score={s.score} best={best} />]) }

  useGameKeys(k => {
    if (KEY_DIR[k]) move(KEY_DIR[k])
    else if (k === 'r') restart()
    else if (k === 'q' || k === 'Escape') quit()
  })
  const swipe = useSwipe(move)

  return (
    <div className="gm">
      <div className="gm-head"><span className="gm-title">2048</span><span>score <b>{s.score}</b></span><span>best <b>{Math.max(best, s.score)}</b></span>{s.won && <span className="gm-ok">★ 2048 reached!</span>}</div>
      <div className="gm-grid" {...swipe}>
        {s.grid.map((v, i) => <div key={i} className="gm-tile" style={tileStyle(v)}>{v || ''}</div>)}
      </div>
      <div className={`gm-msg${s.over ? ' bad' : ''}`}>
        {s.over ? `no moves left — score ${s.score}. press r to restart or q to quit.` : 'arrows / WASD to slide · r restart · q quit'}
      </div>
      <Controls onDir={move} actions={[['restart', restart], ['quit', quit]]} />
    </div>
  )
}
