import type { ReactNode } from 'react'
import { getBest, pick, rnd, saveBest } from './common'

// Turn-based games played through the normal terminal prompt.
export interface TextGame {
  name: string
  intro: ReactNode[]
  input: (raw: string) => { out: ReactNode[]; done?: boolean }
  quit?: () => ReactNode[]
}

// ── GUESS THE NUMBER ──────────────────────────────────────────────────────────
function guess(): TextGame {
  const target = 1 + rnd(100); let tries = 0
  return {
    name: 'guess',
    intro: [<span className="tc-sec">guess the number</span>, <span className="tc-val">I'm thinking of a number between 1 and 100.</span>, <span className="tc-dim">type a number · 'quit' to give up</span>],
    input(raw) {
      const n = Number(raw.trim())
      if (!Number.isInteger(n) || n < 1 || n > 100) return { out: [<span className="tc-err">enter a whole number from 1 to 100</span>] }
      tries++
      if (n === target) return { done: true, out: [<span className="gm-ok">✓ {target} it is! you got it in {tries} {tries === 1 ? 'try' : 'tries'}.</span>] }
      const diff = Math.abs(n - target)
      const heat = diff <= 3 ? 'burning hot' : diff <= 10 ? 'warm' : diff <= 25 ? 'cool' : 'ice cold'
      return { out: [<span className="tc-val">{n < target ? '↑ higher' : '↓ lower'}<span className="tc-dim">  ({heat})</span></span>] }
    },
    quit: () => [<span className="tc-dim">the number was <span className="tc-hi">{target}</span></span>],
  }
}

// ── HANGMAN ───────────────────────────────────────────────────────────────────
const WORDS = ['javascript', 'typescript', 'react', 'spring', 'docker', 'kubernetes', 'python', 'recursion', 'algorithm',
  'compiler', 'database', 'function', 'variable', 'terminal', 'framework', 'interface', 'polymorphism', 'encapsulation',
  'opencv', 'tensorflow', 'mysql', 'hibernate', 'microservice', 'iterator', 'bytecode', 'lambda', 'github', 'deployment']
const LIVES = 6

function gallows(wrong: number) {
  const p = (n: number, ch: string) => wrong > n ? ch : ' '
  return ['  +---+', '  |   |', `  ${p(0, 'O')}   |`, ` ${p(2, '/')}${p(1, '|')}${p(3, '\\')}  |`, ` ${p(4, '/')} ${p(5, '\\')}  |`, '      |', '========='].join('\n')
}

function hangman(): TextGame {
  const word = pick(WORDS), guessed = new Set<string>(); let wrong = 0
  const board = (msg?: ReactNode): ReactNode[] => [
    <pre className={`gm-art${wrong >= LIVES ? ' bad' : ''}`}>{gallows(wrong)}</pre>,
    <span className="gm-word">{[...word].map(c => guessed.has(c) ? c : '_').join(' ')}</span>,
    <span className="tc-dim">lives {'♥'.repeat(LIVES - wrong)}{'♡'.repeat(wrong)} · misses: {[...guessed].filter(c => !word.includes(c)).join(' ') || '—'}</span>,
    ...(msg ? [msg] : []),
  ]
  const end = (won: boolean) => ({
    done: true,
    out: board(won
      ? <span className="gm-ok">✓ you saved them! the word was "{word}".</span>
      : <span className="tc-err">✗ out of lives — the word was "{word}".</span>),
  })
  return {
    name: 'hangman',
    intro: [<span className="tc-sec">hangman</span>, <span className="tc-dim">guess a letter, or the whole word · 'quit' to give up</span>, ...board()],
    input(raw) {
      const g = raw.trim().toLowerCase()
      if (!/^[a-z]+$/.test(g)) return { out: [<span className="tc-err">letters only, please</span>] }
      if (g.length > 1) {
        if (g === word) { [...word].forEach(c => guessed.add(c)); return end(true) }
        wrong++
        return wrong >= LIVES ? end(false) : { out: board(<span className="tc-err">"{g}" isn't it</span>) }
      }
      if (guessed.has(g)) return { out: [<span className="tc-dim">already tried "{g}"</span>] }
      guessed.add(g)
      if (!word.includes(g)) wrong++
      if (wrong >= LIVES) return end(false)
      if ([...word].every(c => guessed.has(c))) return end(true)
      return { out: board(word.includes(g) ? <span className="gm-ok">✓ "{g}" is in there</span> : <span className="tc-err">✗ no "{g}"</span>) }
    },
    quit: () => [<span className="tc-dim">the word was <span className="tc-hi">{word}</span></span>],
  }
}

// ── TYPING TEST ───────────────────────────────────────────────────────────────
const SENTENCES = [
  'the quick brown fox jumps over the lazy dog while the compiler waits patiently',
  'good code is its own best documentation so name things clearly and keep functions small',
  'spring boot makes it easy to create stand alone production grade java applications',
  'first solve the problem then write the code and always test the edge cases',
  'a terminal is just a window into the machine where every keystroke tells a story',
  'react renders the interface while the backend serves data through a clean rest api',
]

function typing(): TextGame {
  const text = pick(SENTENCES), start = Date.now()
  return {
    name: 'typing',
    intro: [<span className="tc-sec">typing test</span>, <span className="tc-dim">type the line below and press enter — the clock starts now</span>, <span />, <span className="gm-word gm-quote">{text}</span>, <span />],
    input(raw) {
      const typed = raw.trim(), mins = (Date.now() - start) / 60000
      const correct = [...text].filter((c, i) => typed[i] === c).length
      const accuracy = correct / Math.max(text.length, typed.length)
      const wpm = Math.round((typed.length / 5 / mins) * accuracy)
      const prevBest = getBest('typing'), counts = accuracy >= 0.8
      if (counts) saveBest('typing', wpm)
      return {
        done: true,
        out: [
          <span>{[...text].map((c, i) => <span key={i} className={typed[i] === c ? 'gm-ok' : 'gm-miss'}>{c}</span>)}</span>,
          <span />,
          <span className="tc-val"><span className="tc-key">wpm</span><b className="tc-hi">{wpm}</b>   <span className="tc-key">accuracy</span>{Math.round(accuracy * 100)}%   <span className="tc-key">time</span>{(mins * 60).toFixed(1)}s</span>,
          !counts ? <span className="tc-dim">needs 80%+ accuracy to count toward your best</span>
            : wpm > prevBest ? <span className="gm-ok">★ new personal best!</span> : <span className="tc-dim">personal best: {prevBest} wpm</span>,
        ],
      }
    },
  }
}

// ── ROCK PAPER SCISSORS ───────────────────────────────────────────────────────
const HANDS = ['rock', 'paper', 'scissors'] as const
const HAND_ICON = ['✊', '✋', '✌️']

function rps(): TextGame {
  const score = { win: 0, lose: 0, draw: 0 }
  const tally = () => <span className="tc-dim">you {score.win} · cpu {score.lose} · draws {score.draw}</span>
  return {
    name: 'rps',
    intro: [<span className="tc-sec">rock · paper · scissors</span>, <span className="tc-dim">type rock, paper or scissors (r / p / s) · 'quit' to stop</span>],
    input(raw) {
      const g = raw.trim().toLowerCase()
      const me = HANDS.findIndex(h => h === g || h[0] === g)
      if (me < 0) return { out: [<span className="tc-err">pick rock, paper or scissors</span>] }
      const cpu = rnd(3), result = (me - cpu + 3) % 3 // 0 draw · 1 win · 2 lose
      const verdict = [<span className="tc-val">draw</span>, <span className="gm-ok">you win!</span>, <span className="tc-err">cpu wins</span>][result]
      score[(['draw', 'win', 'lose'] as const)[result]]++
      return { out: [<span className="tc-val">{HAND_ICON[me]} {HANDS[me]}  <span className="tc-dim">vs</span>  {HAND_ICON[cpu]} {HANDS[cpu]}  <span className="tc-dim">→</span> {verdict}</span>, tally()] }
    },
    quit: () => [<span className="tc-val">final score — {tally()}</span>],
  }
}

export const TEXT_GAMES: Record<string, () => TextGame> = { guess, hangman, typing, rps }
