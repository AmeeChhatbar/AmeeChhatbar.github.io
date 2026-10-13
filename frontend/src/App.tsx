import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import './App.css'
import formalPhoto from './assets/formal.jpeg'
import casualPhoto from './assets/causal.jpeg'
import { GAMES, getBest } from './games/common'
import { Game2048, Snake } from './games/live'
import type { LiveGameProps } from './games/live'
import { TEXT_GAMES } from './games/text'
import type { TextGame } from './games/text'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Experience { company: string; role: string; period: string; points: string[]; tools: string[] }
interface Project { title: string; description: string; stack: string[]; githubUrl: string }
interface PortfolioData {
  name: string; taglines: string[]; email: string; phone: string; linkedin: string; degree: string
  skills: { languages: string[]; tools: string[] }
  experiences: Experience[]; projects: Project[]
  achievements: string[]; certificates: string[]
}
const hasRepo = (p: Project) => !!p.githubUrl && p.githubUrl !== '#'

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, on }
}

// ── TERMINAL SYSTEM ───────────────────────────────────────────────────────────
interface Line { id: number; el: ReactNode }
let _lid = 0
const L = (el: ReactNode): Line => ({ id: _lid++, el })
const BL = () => L(null)

const ASCII_NAME = [
  '....#.....##...##..#######..#######.',
  '..#####...###.###..##.......##......',
  '.##...##..##.#.##..######...######..',
  '.#######..##...##..##.......##......',
  '.##...##..##...##..#######..#######.',
]
const TCMDS: [string, string, string][] = [
  ['who','w','personal info & contact'],['skills','s','languages and tools'],
  ['experience','exp','internship history'],['projects','pj','featured projects'],
  ['achievements','a','achievements & certs'],['games','g','play terminal games'],
  ['banner','b','show this screen'],['clear','','clear the terminal'],
]
const LIVE_GAMES: Record<string, (p: LiveGameProps) => ReactNode> = { snake: Snake, '2048': Game2048 }
function LiveGame({ name, onExit }: LiveGameProps & { name: string }) {
  return name === 'snake' ? <Snake onExit={onExit}/> : <Game2048 onExit={onExit}/>
}
type ActiveGame = { kind: 'live'; name: string } | { kind: 'text'; game: TextGame }
function tcRow(c: string, s: string, d: string) {
  return L(<div className="tc-row"><span><span className="tc-br">[</span><span className="tc-name">{c}</span><span className="tc-br">]</span>{s&&<><span className="tc-dim"> or </span><span className="tc-br">[</span><span className="tc-name">{s}</span><span className="tc-br">]</span></>}</span><span className="tc-desc">{d}</span></div>)
}
function buildBanner(d: PortfolioData): Line[] {
  return [BL(),...ASCII_NAME.map(r=>L(<pre className="tc-ascii">{r}</pre>)),L(<span className="tc-sub">C . H . H . A . T . B . A . R</span>),BL(),L(<span className="tc-val">Welcome to <span className="tc-hi">{d.name}</span>'s portfolio!</span>),L(<span className="tc-dim">Type <span className="tc-name">'help'</span> to see available commands.</span>),BL(),...buildHelp()]
}
function buildHelp(): Line[] {
  return [L(<span className="tc-sec">Available Commands:</span>),BL(),...TCMDS.map(([c,s,d])=>tcRow(c,s,d)),BL(),L(<span className="tc-sec">Contact:</span>),BL(),...['email','linkedin','phone'].map(c=>L(<span><span className="tc-br">[</span><span className="tc-name">{c}</span><span className="tc-br">]</span></span>)),BL()]
}
function buildAbout(d: PortfolioData): Line[] {
  return [BL(),L(<span className="tc-sec">$ whoami</span>),BL(),L(<><span className="tc-key">name    </span><span className="tc-val">{d.name}</span></>),L(<><span className="tc-key">email   </span><a className="tc-lnk" href={`mailto:${d.email}`}>{d.email}</a></>),L(<><span className="tc-key">phone   </span><span className="tc-val">{d.phone}</span></>),L(<><span className="tc-key">linkedin</span><a className="tc-lnk" href={d.linkedin} target="_blank" rel="noreferrer">{d.linkedin.replace('https://','')}</a></>),L(<><span className="tc-key">degree  </span><span className="tc-val">{d.degree}</span></>),BL(),L(<span className="tc-key">roles</span>),...d.taglines.map(t=>L(<><span className="tc-bul">  ▸ </span><span className="tc-val">{t}</span></>)),BL()]
}
function buildSkills(d: PortfolioData): Line[] {
  return [BL(),L(<span className="tc-sec">$ skills --list</span>),BL(),L(<span className="tc-key">languages</span>),L(<div className="tc-tags">{d.skills.languages.map(s=><span key={s} className="tc-tag">{s}</span>)}</div>),BL(),L(<span className="tc-key">tools & frameworks</span>),L(<div className="tc-tags">{d.skills.tools.map(s=><span key={s} className="tc-tag">{s}</span>)}</div>),BL()]
}
function buildExperience(d: PortfolioData): Line[] {
  const ls: Line[] = [BL(),L(<span className="tc-sec">$ cat experience.log</span>),BL()]
  d.experiences.forEach((exp,i)=>{ls.push(L(<><span className="tc-role">{exp.role}</span><span className="tc-dim"> @ </span><span className="tc-val">{exp.company}</span></>));ls.push(L(<span className="tc-dim">{exp.period}</span>));exp.points.forEach(p=>ls.push(L(<><span className="tc-bul">  · </span><span className="tc-val">{p}</span></>)));ls.push(L(<div className="tc-tags sm">{exp.tools.map(t=><span key={t} className="tc-tag accent">{t}</span>)}</div>));if(i<d.experiences.length-1)ls.push(BL())})
  ls.push(BL());return ls
}
function buildProjects(d: PortfolioData): Line[] {
  const ls: Line[] = [BL(),L(<span className="tc-sec">$ ls projects/</span>),BL()]
  d.projects.forEach((proj,i)=>{ls.push(L(<span className="tc-proj">{proj.title}</span>));ls.push(L(<span className="tc-dim">{proj.description}</span>));if(hasRepo(proj))ls.push(L(<a className="tc-lnk" href={proj.githubUrl} target="_blank" rel="noreferrer">{proj.githubUrl.replace('https://','')}</a>));ls.push(L(<div className="tc-tags sm">{proj.stack.map(s=><span key={s} className="tc-tag">{s}</span>)}</div>));if(i<d.projects.length-1)ls.push(BL())})
  ls.push(BL());return ls
}
function buildAchievements(d: PortfolioData): Line[] {
  return [BL(),L(<span className="tc-sec">$ cat achievements.txt</span>),BL(),L(<span className="tc-key">achievements</span>),...d.achievements.map(a=>L(<><span className="tc-bul">  ▸ </span><span className="tc-val">{a}</span></>)),BL(),L(<span className="tc-key">certificates</span>),...d.certificates.map(c=>L(<><span className="tc-bul">  ▸ </span><span className="tc-val">{c}</span></>)),BL()]
}
function buildGames(): Line[] {
  const bestLabel = (g: string) => { const b = getBest(g); return b ? `  · best ${b}${g==='typing'?' wpm':''}` : '' }
  return [BL(),L(<span className="tc-sec">$ ls ~/games</span>),BL(),...GAMES.map(([c,d])=>tcRow(c,'',d+bestLabel(c))),BL(),L(<span className="tc-dim">type a game's name to play, e.g. <span className="tc-name">snake</span> — type <span className="tc-name">quit</span> to leave a game</span>),BL()]
}

function TPrompt({ game }: { game?: string }) {
  if (game) return <span className="tc-prompt" aria-hidden><span className="tc-p-p">{game}</span><span className="tc-p-d">&gt; </span></span>
  return <span className="tc-prompt" aria-hidden><span className="tc-p-u">amee</span><span className="tc-p-at">@</span><span className="tc-p-h">portfolio</span><span className="tc-p-s">:</span><span className="tc-p-p">~</span><span className="tc-p-d">$ </span></span>
}

function TerminalEmulator({ data }: { data: PortfolioData }) {
  const [lines, setLines] = useState<Line[]>(() => buildBanner(data))
  const [input, setInput] = useState('')
  const [cmdHist, setCmdHist] = useState<string[]>([])
  const [, setHistIdx] = useState(-1)
  const [game, setGame] = useState<ActiveGame | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines, game])
  useEffect(() => { if (game?.kind !== 'live') inputRef.current?.focus() }, [game])
  const runTextGame = (g: TextGame, raw: string) => {
    const echo = L(<div className="tc-echo"><TPrompt game={g.name}/><span>{raw}</span></div>)
    if (['quit','exit'].includes(raw.trim().toLowerCase())) {
      setGame(null); setLines(p=>[...p,echo,...(g.quit?.()??[]).map(L),L(<span className="tc-dim">left {g.name}. type [games] to play again.</span>),BL()]); return
    }
    const r = g.input(raw)
    if (r.done) setGame(null)
    setLines(p=>[...p,echo,...r.out.map(L),...(r.done?[BL(),L(<span className="tc-dim">thanks for playing! type [{g.name}] for another round.</span>),BL()]:[])])
  }
  const run = (raw: string) => {
    if (game?.kind === 'text') return runTextGame(game.game, raw)
    const cmd = raw.trim().toLowerCase()
    const echo = L(<div className="tc-echo"><TPrompt /><span>{raw}</span></div>)
    const gameName = cmd.replace(/^play\s+/, '')
    if (LIVE_GAMES[gameName]) { setGame({ kind: 'live', name: gameName }); setLines(p=>[...p,echo]); return }
    if (TEXT_GAMES[gameName]) { const g = TEXT_GAMES[gameName](); setGame({ kind: 'text', game: g }); setLines(p=>[...p,echo,BL(),...g.intro.map(L),BL()]); return }
    if (cmd === 'clear') { setLines([]); return }
    if (cmd === 'email') { window.open(`mailto:${data.email}`); setLines(p=>[...p,echo,L(<span className="tc-dim">opening email client...</span>),BL()]); return }
    if (cmd === 'linkedin') { window.open(data.linkedin,'_blank'); setLines(p=>[...p,echo,L(<span className="tc-dim">opening LinkedIn...</span>),BL()]); return }
    if (cmd === 'phone') { setLines(p=>[...p,echo,L(<><span className="tc-key">phone </span><span className="tc-val">{data.phone}</span></>),BL()]); return }
    let out: Line[]
    switch(cmd){
      case 'help': out=buildHelp();break
      case 'who':case 'w':case 'whoami':case 'about': out=buildAbout(data);break
      case 'skills':case 's': out=buildSkills(data);break
      case 'experience':case 'exp':case 'e': out=buildExperience(data);break
      case 'projects':case 'pj': out=buildProjects(data);break
      case 'achievements':case 'a':case 'certs': out=buildAchievements(data);break
      case 'games':case 'g':case 'play': out=buildGames();break
      case 'banner':case 'b': out=buildBanner(data);break
      case '': out=[];break
      default: out=[BL(),L(<><span className="tc-err">command not found: {cmd}</span><span className="tc-dim"> — type [help]</span></>),BL()]
    }
    setLines(p=>[...p,echo,...out])
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key==='Enter'){const v=input;if(v.trim())setCmdHist(h=>[v,...h]);setHistIdx(-1);run(v);setInput('')}
    else if(e.key==='ArrowUp'){e.preventDefault();setHistIdx(p=>{const n=Math.min(p+1,cmdHist.length-1);setInput(cmdHist[n]??'');return n})}
    else if(e.key==='ArrowDown'){e.preventDefault();setHistIdx(p=>{const n=Math.max(p-1,-1);setInput(n===-1?'':cmdHist[n]??'');return n})}
  }
  return (
    <div className="tc-body" onClick={()=>inputRef.current?.focus()}>
      {lines.map(l=><div key={l.id} className="tc-line">{l.el}</div>)}
      {game?.kind === 'live' ? <LiveGame name={game.name} onExit={summary=>{ setGame(null); setLines(p=>[...p,BL(),...summary.map(L),BL()]) }}/>
      : <div className="tc-input-row"><TPrompt game={game?.kind === 'text' ? game.game.name : undefined}/><input ref={inputRef} className="tc-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"/></div>}
      <div ref={bottomRef}/>
    </div>
  )
}

function TerminalModal({ data, onClose }: { data: PortfolioData; onClose: () => void }) {
  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => { if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-window">
        <div className="modal-bar">
          <div className="modal-dots"><span className="mdot red" onClick={onClose}/><span className="mdot yellow"/><span className="mdot green"/></div>
          <span className="modal-ttl">amee@portfolio — zsh</span>
          <div style={{width:52}}/>
        </div>
        <TerminalEmulator data={data}/>
      </div>
    </div>
  )
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ onTerminal }: { onTerminal: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`site-nav${scrolled?' scrolled':''}`}>
      <a className="nav-logo" href="#home"><span className="nav-red">AMEE </span>CHHATBAR.</a>
      <div className="nav-center">
        <span className="nav-active-dot"/>
        <a href="#home" className="nav-link">HOME</a>
        <a href="#engineering" className="nav-link">ENGINEERING</a>
        <a href="#guestbook" className="nav-link nav-gb">GUESTBOOK</a>
        <button className="nav-terminal-btn" onClick={onTerminal}>&gt;_ TERMINAL</button>
      </div>
      <div className="nav-right">
        <a className="nav-resume-btn" href={`${import.meta.env.BASE_URL}Amee_Chhatbar_Resume.pdf`} download="Amee_Chhatbar_Resume.pdf">↓ RESUME</a>
      </div>
    </nav>
  )
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function PhotoFrame({ className, src, alt = '' }: { className: string; src?: string; alt?: string }) {
  return (
    <div className={`hero-frame ${className}`}>
      <div className="photo-inner">
        <div className="photo-corner tl"/><div className="photo-corner tr"/>
        {src ? <img className="photo-img" src={src} alt={alt}/> : <div className="photo-placeholder"><span>ADD PHOTO</span></div>}
        <div className="photo-corner bl"/><div className="photo-corner br"/>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="s-hero" id="home">
      <div className="hero-name-block">
        <h1 className="hero-name">AMEE<br/>CHHATBAR</h1>
      </div>
      <div className="hero-bottom">
        <div className="hero-role">
          <p>ML RESEARCHER</p>
          <p>AND</p>
          <p>JAVA DEVELOPER.</p>
        </div>
        <div className="hero-photos">
          <PhotoFrame className="hero-frame-1" src={formalPhoto} alt="Amee Chhatbar"/>
          <PhotoFrame className="hero-frame-2" src={casualPhoto} alt="Amee Chhatbar"/>
        </div>
        <div className="hero-status">
          <p>OPEN FOR<br/>FULL-TIME ROLES</p>
          <p>FREELANCE PROJECT</p>
          <p className="hero-location">BASED IN<br/>AHMEDABAD, INDIA</p>
        </div>
      </div>
    </section>
  )
}

// ── QUOTE ─────────────────────────────────────────────────────────────────────
function QuoteSection() {
  const { ref, on } = useReveal(0.2)
  return (
    <section className="s-quote">
      <div className="quote-marks">&#8220;</div>
      <div className={`quote-text reveal${on?' on':''}`} ref={ref}>
        In a world where data is noise<br/>and patterns are gold,<br/>
        <strong>machine learning is the act</strong><br/>of listening.
      </div>
      <CircleDot />
    </section>
  )
}

// ── IDENTITY ──────────────────────────────────────────────────────────────────
function IdentitySection() {
  const { ref, on } = useReveal()
  return (
    <section className="s-identity">
      <div className="id-label"><span className="id-arrow">↳</span><span>IDENTITY</span></div>
      <div className="id-who">WHO</div>
      <div className={`id-desc reveal${on?' on':''}`} ref={ref}>
        <div className="id-bar"/>
        <div className="id-text">
          <p>I build <strong>intelligent systems</strong> using <span className="txt-red">Python</span> and <span className="txt-red">Machine Learning</span>. Researched at <strong>ISRO</strong> using INSAT-3DR satellite data — achieving <strong>90% accuracy</strong> in convective cloud prediction.</p>
          <br/>
          <p>Beyond research, I engineer backend systems with <strong>Java</strong> and <strong>Spring Boot</strong>. I bridge the gap between data science and production-grade software.</p>
        </div>
      </div>
    </section>
  )
}

// ── STATS ─────────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'EXP_YRS', value: '01+', desc: 'YEARS EXPERIENCE' },
  { label: 'PRJ_CMP', value: '4+',  desc: 'PROJECTS COMPLETED' },
  { label: 'ACCURACY', value: '90%', desc: 'ML MODEL ACCURACY' },
  { label: 'AVAIL',   value: 'OPEN', desc: 'FOR NEW OPPORTUNITIES', green: true },
]
function StatsSection() {
  const { ref, on } = useReveal()
  return (
    <section className="s-stats">
      <div className={`stats-grid reveal${on?' on':''}`} ref={ref}>
        {STATS.map((s,i) => (
          <div key={i} className="stat-box">
            <span className="stat-label">{s.label}</span>
            <div className="stat-value">{s.green && <span className="stat-green-dot"/>}{s.value}</div>
            <span className="stat-desc">{s.desc}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── TECH STACK ────────────────────────────────────────────────────────────────
const NODES = [
  { num:'[01] DEVICE_NODE', title:'ML & DATA SCIENCE', skills:[{n:'PYTHON (CORE & ML)',p:85},{n:'SCIKIT-LEARN',p:80},{n:'PANDAS / NUMPY',p:80},{n:'DATA ANALYSIS',p:75},{n:'MODEL BUILDING',p:85}] },
  { num:'[02] DEVICE_NODE', title:'JAVA ENGINEERING',  skills:[{n:'JAVA (CORE & ADV)',p:90},{n:'SPRING BOOT / MVC',p:75},{n:'MYSQL / JDBC',p:80},{n:'OOP DESIGN',p:85},{n:'RESTFUL APIS',p:70}] },
  { num:'[03] DEVICE_NODE', title:'WEB & FRONTEND',    skills:[{n:'HTML / CSS',p:85},{n:'JAVASCRIPT',p:70},{n:'REACT',p:65},{n:'RESPONSIVE DESIGN',p:80},{n:'FIGMA',p:75}] },
  { num:'[04] DEVICE_NODE', title:'TOOLS & CORE',      skills:[{n:'GIT / VERSION CTRL',p:85},{n:'SHELL SCRIPT',p:70},{n:'ANDROID STUDIO',p:60},{n:'DATA STRUCTURES',p:80},{n:'ALGORITHMS',p:80}] },
]
const TICKER = ['JAVA','PYTHON','C++','JAVASCRIPT','SPRING BOOT','SCIKIT-LEARN','MYSQL','REACT','HTML','CSS','GIT','PANDAS','NUMPY','MATPLOTLIB','JDBC','FIGMA','ANDROID STUDIO','SHELL SCRIPT']

function SkillBar({ n, p, on }: { n: string; p: number; on: boolean }) {
  return (
    <div className="sb-item">
      <div className="sb-head"><span className="sb-name">{n}</span><span className="sb-pct">{p}%</span></div>
      <div className="sb-track"><div className="sb-fill" style={{ width: on ? `${p}%` : '0%' }}/></div>
    </div>
  )
}

function TechStackSection() {
  const { ref: hr, on: ho } = useReveal()
  const { ref: nr, on: no } = useReveal()
  const ticker = [...TICKER, ...TICKER]
  return (
    <section className="s-tech" id="engineering">
      <div className={`tech-header reveal${ho?' on':''}`} ref={hr}>
        <div className="tech-title">
          <span className="tech-outlined">TECHNICAL</span>
          <span className="tech-filled"> STACK_</span>
        </div>
        <div className="tech-meta">
          <span>// SYSTEM_INVENTORY_V2.0</span>
          <span>OPTIMIZED FOR SCALABILITY &amp; PERFORMANCE</span>
        </div>
      </div>
      <div className={`nodes-grid reveal${no?' on':''}`} ref={nr}>
        {NODES.map((node,i) => (
          <div key={i} className="device-node">
            <span className="node-num">{node.num}</span>
            <h3 className="node-title">{node.title}</h3>
            {node.skills.map((s,j) => <SkillBar key={j} n={s.n} p={s.p} on={no}/>)}
          </div>
        ))}
      </div>
      <div className="ticker-wrap">
        <div className="ticker-track">
          {ticker.map((item,i) => <span key={i} className="ticker-item"><span className="ticker-diamond">◆</span> {item}</span>)}
        </div>
      </div>
    </section>
  )
}

// ── SELECTED WORKS ────────────────────────────────────────────────────────────
const WORK_META = [
  { num:'01 / 2024', cat:'ML RESEARCH' },
  { num:'02 / 2023', cat:'DATA SCIENCE' },
  { num:'03 / 2022', cat:'BACKEND ENGINEERING' },
  { num:'04 / 2022', cat:'WEB DEVELOPMENT' },
]

function WorkItem({ proj, meta }: { proj: Project; meta: { num: string; cat: string } }) {
  const { ref, on } = useReveal()
  return (
    <div className={`work-item reveal${on?' on':''}`} ref={ref}>
      <div className="work-side-left">
        <span className="work-num">{meta.num}</span>
        <h3 className="work-cat">{meta.cat}</h3>
        <div className="work-stack">{proj.stack.map(s=><span key={s}>{s}</span>)}</div>
      </div>
      <div className="work-center">
        <div className="work-title">{proj.title.toUpperCase()}</div>
        <p className="work-desc">{proj.description}</p>
        {hasRepo(proj) && <a className="work-link" href={proj.githubUrl} target="_blank" rel="noreferrer">VIEW ON GITHUB ↗</a>}
      </div>
      <CircleDot/>
    </div>
  )
}

function SelectedWorksSection({ projects }: { projects: Project[] }) {
  return (
    <section className="s-works">
      <div className="works-label">SELECTED WORKS</div>
      {projects.slice(0, 4).map((proj, i) => (
        <WorkItem key={i} proj={proj} meta={WORK_META[i] ?? { num:`0${i+1} / 2024`, cat:'ENGINEERING' }}/>
      ))}
    </section>
  )
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
const TIMELINE = [
  { year:'2021', title:'GENESIS',      desc:'Started B.Tech CSE at Indus University, Ahmedabad.' },
  { year:'2022', title:'FOUNDATIONS',  desc:'Skill Development Intern + Coding Club Coordinator at SAC.' },
  { year:'2023', title:'ENGINEERING',  desc:'Machine Learning Intern at Brainybeams Technologies — 86% accuracy sonar classifier.' },
  { year:'2024', title:'INNOVATION',   desc:'Research Intern at ISRO — convective cloud prediction 90% accuracy, presented at Tropmet Conference.' },
  { year:'2025', title:'GRADUATION',   desc:'B.Tech CSE completed — CGPA 9.6/10.' },
]

function TimelineItem({ year, title, desc }: { year: string; title: string; desc: string }) {
  const { ref, on } = useReveal()
  return (
    <div className={`tl-item reveal${on?' on':''}`} ref={ref}>
      <span className="tl-year">{year}</span>
      <span className="tl-title">{title}</span>
      <a className="tl-arrow">↗</a>
      <p className="tl-desc">{desc}</p>
    </div>
  )
}

function TimelineSection() {
  const { ref, on } = useReveal()
  return (
    <section className="s-timeline">
      <div className={`tl-header reveal${on?' on':''}`} ref={ref}>
        <div className="tl-meta">
          <span>// SYSTEM_LOGS_V3.0</span>
          <span>COMMITS_&amp;_MILESTONES</span>
        </div>
        <div className="tl-big-title">
          <span className="tl-outlined">DIGITAL</span>
          <span className="tl-filled"> EVOLUTION_</span>
        </div>
      </div>
      <div className="tl-list">
        {TIMELINE.map((t,i) => <TimelineItem key={i} {...t}/>)}
      </div>
    </section>
  )
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function ContactSection({ data }: { data: PortfolioData }) {
  const { ref, on } = useReveal()
  const send = () => window.open(`mailto:${data.email}`)
  return (
    <section className="s-contact" id="guestbook">
      <div className="contact-grid">
        <div className={`contact-left reveal${on?' on':''}`} ref={ref}>
          <div className="contact-big">
            <span className="contact-outlined">LET'S</span><br/>
            <span className="contact-filled">CONNECT.<span className="contact-dot">•</span></span>
          </div>
          <p className="contact-sub">I specialize in machine learning and Java engineering. Open to discussing ML projects, research collaborations, and full-time opportunities.</p>
          <p className="contact-sub">Currently open to technical challenges or full-time roles.</p>
        </div>
        <div className="contact-right">
          <div className="contact-row-2">
            <input className="cfield" placeholder="NAME" type="text"/>
            <input className="cfield" placeholder="EMAIL" type="email"/>
          </div>
          <input className="cfield cfull" placeholder="SUBJECT (E.G. INTERNSHIP OPPORTUNITY, COLLABORATION)" type="text"/>
          <textarea className="cfield cfull cmsg" placeholder="MESSAGE" rows={5}/>
          <div className="contact-send-wrap">
            <button className="contact-send" onClick={send}>SEND MESSAGE →</button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id) }, [])
  return <>{t.toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour12:false})} IST</>
}

function Footer({ data }: { data: PortfolioData }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo"><span className="nav-red">AMEE </span>CHHATBAR.</div>
          <p className="footer-tagline">CS ENGINEER<br/>ML RESEARCHER</p>
          <p className="footer-location">BASED IN INDIA</p>
          <p className="footer-time"><Clock/></p>
        </div>
        <div className="footer-col">
          <h4 className="footer-col-h">INDEX</h4>
          <nav className="footer-nav">
            <a href="#home">HOME</a>
            <a href="#engineering">ENGINEERING</a>
            <a href="#guestbook">GUESTBOOK</a>
          </nav>
        </div>
        <div className="footer-col">
          <h4 className="footer-col-h">CONNECT</h4>
          <nav className="footer-nav">
            <a href={data.linkedin} target="_blank" rel="noreferrer">LINKEDIN</a>
            <a href={`mailto:${data.email}`}>EMAIL</a>
          </nav>
        </div>
        <div className="footer-status-col">
          <div className="footer-status-badge">STATUS</div>
          <div className="footer-open"><span className="status-green"/>OPEN FOR WORK</div>
          <button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>↑</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 AMEE CHHATBAR. ALL RIGHTS RESERVED.</span>
        <span>DESIGNED &amp; BUILT BY ME · SYSTEM STATUS: OPERATIONAL</span>
      </div>
    </footer>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function CircleDot() {
  return <div className="circle-dot"><div className="circle-inner"/></div>
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [showTerminal, setShowTerminal] = useState(false)
  useEffect(() => { fetch('http://localhost:8080/api/portfolio').then(r=>r.json()).then(setData) }, [])
  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => { if((e.ctrlKey||e.metaKey)&&e.key==='`'){e.preventDefault();setShowTerminal(v=>!v)} }
    window.addEventListener('keydown', h); return ()=>window.removeEventListener('keydown', h)
  }, [])

  if (!data) return (
    <div className="site-loading">
      <div className="loading-text">LOADING_<span className="loading-cursor">▌</span></div>
    </div>
  )

  return (
    <>
      <Nav onTerminal={()=>setShowTerminal(true)}/>
      <HeroSection/>
      <QuoteSection/>
      <IdentitySection/>
      <StatsSection/>
      <TechStackSection/>
      <SelectedWorksSection projects={data.projects}/>
      <TimelineSection/>
      <ContactSection data={data}/>
      <Footer data={data}/>
      {showTerminal && <TerminalModal data={data} onClose={()=>setShowTerminal(false)}/>}
    </>
  )
}
