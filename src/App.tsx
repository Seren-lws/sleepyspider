import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import {
  bestTarget, canMove, collect, deal, dealsLeft, findCompleted, hasEmptyCol, hints, isRun, isWon,
  moveCards, newGame, undoTo, SETS, type Card, type Difficulty, type GameState, type Hint,
} from './game/engine'
import { loadGame, loadPrefs, saveGame, savePrefs, type Prefs } from './storage'
import { CardBack, CardView } from './ui/CardView'
import { Decor } from './ui/Decor'
import { EASE, Flipper, flyToSlot, shake } from './ui/flip'
import {
  Bow, CROWN_PATH, Crown, GoldDefs, IconCards, IconHint, IconMoon, IconSettings, IconSun, IconUndo, Pip,
} from './ui/icons'
import { NewGameSheet, SettingsSheet } from './ui/Sheets'
import { WinOverlay } from './ui/WinOverlay'

const fmtTime = (sec: number) => {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60
  const mmss = `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return h ? `${h}:${mmss}` : mmss
}

const isNightHour = (d = new Date()) => d.getHours() >= 21 || d.getHours() < 6

/** 每张牌在列里离顶端多远；牌太多放不下时自动挤紧一点 */
function columnTops(col: Card[], cw: number, avail: number): number[] {
  const ch = cw * 1.42
  let dg = cw * 0.2, ug = cw * 0.56
  let d = 0
  while (d < col.length && !col[d].up) d++
  const u = col.length - d
  if (d * dg + Math.max(0, u - 1) * ug + ch > avail) {
    dg = Math.min(dg, cw * 0.12)
    if (u > 1) ug = Math.max(cw * 0.26, Math.min(ug, (avail - ch - d * dg) / (u - 1)))
  }
  const tops: number[] = []
  let y = 0
  for (const c of col) {
    tops.push(y)
    y += c.up ? ug : dg
  }
  return tops
}

function Clock({ running, elapsed }: { running: boolean; elapsed: { current: number } }) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return // 锁屏、切走时不计时
      elapsed.current += 1
      tick((x) => x + 1)
    }, 1000)
    return () => window.clearInterval(t)
  }, [running, elapsed])
  return <b>{fmtTime(elapsed.current)}</b>
}

interface Drag {
  col: number
  idx: number
  x0: number
  y0: number
  els: HTMLElement[]
  moved: boolean
  pid: number
}

function boot() {
  const prefs = loadPrefs()
  const saved = loadGame()
  if (saved && !isWon(saved.game)) return { prefs, ...saved }
  return { prefs, game: newGame(prefs.difficulty), history: [] as GameState[], elapsed: 0 }
}

export default function App() {
  const [init] = useState(boot)
  const [prefs, setPrefs] = useState<Prefs>(init.prefs)
  const [game, setGame] = useState<GameState>(init.game)
  const [lay, setLay] = useState({ cw: 0, avail: 0 })
  const [hint, setHint] = useState<Hint | null>(null)
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null)
  const [sheet, setSheet] = useState<'new' | 'settings' | null>(null)
  const [win, setWin] = useState(false)
  const [fresh, setFresh] = useState(-1)
  const [, setMinute] = useState(0)

  const gameRef = useRef(init.game)
  const history = useRef<GameState[]>(init.history)
  const elapsed = useRef(init.elapsed)
  const prefsRef = useRef(prefs)
  const busy = useRef(false)
  const drag = useRef<Drag | null>(null)
  const flipper = useRef(new Flipper())
  const lastGame = useRef<GameState | null>(null)
  const spawnFrom = useRef<Element | null>(null)
  const hintCursor = useRef({ moves: -1, i: 0 })
  const timers = useRef<{ hint?: number; toast?: number }>({})

  const appRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLElement>(null)
  const stockRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => { prefsRef.current = prefs }, [prefs])

  /* ---------- 量尺寸：牌宽跟着屏幕宽度走 ---------- */
  useLayoutEffect(() => {
    const app = appRef.current!, tab = tabRef.current!
    const measure = () => {
      const cw = Math.max(20, (app.clientWidth - 16 - 36) / 10)
      const avail = tab.clientHeight - 10
      setLay((l) => (Math.abs(l.cw - cw) < 0.1 && Math.abs(l.avail - avail) < 1 ? l : { cw, avail }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(app)
    ro.observe(tab)
    return () => ro.disconnect()
  }, [])

  /* ---------- 每次牌局变化后，让牌滑过去 ---------- */
  useLayoutEffect(() => {
    if (!lay.cw || !appRef.current) return
    const changed = lastGame.current !== game
    lastGame.current = game
    const from = spawnFrom.current ?? appRef.current.querySelector('[data-stock-top]') ?? stockRef.current
    spawnFrom.current = null
    flipper.current.play(appRef.current, from?.getBoundingClientRect() ?? null, changed)
  }, [game, lay])

  /* ---------- 夜晚模式 ---------- */
  const night = prefs.theme === 'night' || (prefs.theme === 'auto' && isNightHour())
  useEffect(() => {
    if (prefs.theme !== 'auto') return
    const t = window.setInterval(() => setMinute((m) => m + 1), 60_000)
    return () => window.clearInterval(t)
  }, [prefs.theme])
  useEffect(() => {
    const root = document.documentElement
    if (night) root.dataset.theme = 'night'
    else delete root.dataset.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#251B28' : '#FFF7EF')
  }, [night])

  /* ---------- 切走/关掉时存一下（包括计时） ---------- */
  useEffect(() => {
    const save = () => saveGame(gameRef.current, history.current, elapsed.current)
    const onVis = () => { if (document.visibilityState === 'hidden') save() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', save)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', save)
    }
  }, [])

  function updatePrefs(p: Partial<Prefs>) {
    setPrefs((old) => {
      const n = { ...old, ...p }
      savePrefs(n)
      return n
    })
  }

  function commit(n: GameState) {
    gameRef.current = n
    setGame(n)
    saveGame(n, history.current, elapsed.current)
  }

  function say(text: string) {
    window.clearTimeout(timers.current.toast)
    setToast({ text, id: Date.now() })
    timers.current.toast = window.setTimeout(() => setToast(null), 2600)
  }

  function clearHint() {
    window.clearTimeout(timers.current.hint)
    setHint(null)
  }

  /** 走完一步后：有凑齐的整串就收走，全收完就赢 */
  function settle(n: GameState) {
    if (!findCompleted(n).length) {
      if (isWon(n)) {
        busy.current = true
        window.setTimeout(() => { if (isWon(gameRef.current)) setWin(true) }, 1100)
      }
      return
    }
    busy.current = true
    window.setTimeout(() => {
      const cur = gameRef.current
      const c = findCompleted(cur)[0]
      busy.current = false
      if (c === undefined) return
      const app = appRef.current
      if (app) flyToSlot(app, cur.cols[c].slice(-13).map((x) => x.id), app.querySelector(`[data-slot="${cur.done.length}"]`))
      const next = collect(cur, c)
      setFresh(next.done.length - 1)
      commit(next)
      settle(next)
    }, 320)
  }

  function doMove(from: number, idx: number, to: number) {
    const g = gameRef.current
    if (!canMove(g, from, idx, to)) return
    history.current.push(g)
    clearHint()
    const n = moveCards(g, from, idx, to)
    commit(n)
    settle(n)
  }

  function onStock() {
    if (busy.current) return
    const g = gameRef.current
    if (!dealsLeft(g)) return
    if (hasEmptyCol(g)) {
      say('有空列的时候不能发牌哦，先放一张牌进去吧')
      return
    }
    history.current.push(g)
    clearHint()
    const n = deal(g)
    commit(n)
    settle(n)
  }

  function onUndo() {
    if (busy.current) return
    const prev = history.current.pop()
    if (!prev) return
    const cur = gameRef.current
    // 撤销了一次收牌：那 13 张从格子里飞回来
    if (prev.done.length < cur.done.length) spawnFrom.current = appRef.current?.querySelector(`[data-slot="${prev.done.length}"]`) ?? null
    clearHint()
    setFresh(-1)
    commit(undoTo(prev, cur))
  }

  function onHint() {
    if (busy.current) return
    const g = gameRef.current
    const list = hints(g)
    if (!list.length) {
      say(dealsLeft(g) && hasEmptyCol(g) ? '先挪一张牌到空列里，才能发牌哦' : '好像走不动了……可以撤销几步，或者开新的一局')
      return
    }
    if (hintCursor.current.moves !== g.moves) hintCursor.current = { moves: g.moves, i: 0 }
    const h = list[hintCursor.current.i % list.length]
    hintCursor.current.i++
    // 提示次数只是记一笔，不算牌局变化
    gameRef.current = { ...g, hints: g.hints + 1 }
    window.clearTimeout(timers.current.hint)
    setHint(h)
    timers.current.hint = window.setTimeout(() => setHint(null), 2600)
  }

  function startGame(d: Difficulty, seed?: number) {
    history.current = []
    elapsed.current = 0
    busy.current = false
    flipper.current.reset()
    clearHint()
    setWin(false)
    setFresh(-1)
    setSheet(null)
    updatePrefs({ difficulty: d })
    commit(newGame(d, seed))
  }

  /* ---------- 拖牌 / 点牌 ---------- */
  const release = (els: HTMLElement[]) => {
    for (const el of els) {
      el.style.transform = ''
      delete el.dataset.dragging
    }
  }

  function onPointerDown(e: RPointerEvent) {
    if (busy.current || e.button > 0 || drag.current) return
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-card]')
    if (!el || !tabRef.current) return
    const col = Number(el.dataset.col), idx = Number(el.dataset.idx)
    if (!isRun(gameRef.current.cols[col], idx)) {
      shake([el])
      return
    }
    const els = Array.from(tabRef.current.querySelectorAll<HTMLElement>(`[data-col="${col}"]`))
      .filter((x) => Number(x.dataset.idx) >= idx)
    drag.current = { col, idx, x0: e.clientX, y0: e.clientY, els, moved: false, pid: e.pointerId }
  }

  function onPointerMove(e: PointerEvent) {
    const d = drag.current
    if (!d || e.pointerId !== d.pid) return
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 7) return
      d.moved = true
      clearHint()
      for (const el of d.els) {
        for (const a of el.getAnimations()) a.cancel()
        el.dataset.dragging = '1'
      }
    }
    for (const el of d.els) el.style.transform = `translate(${dx}px,${dy}px)`
  }

  function springBack(els: HTMLElement[]) {
    for (const el of els) {
      const t = el.style.transform
      release([el])
      if (t) el.animate([{ transform: t, zIndex: 50 }, { transform: 'none', zIndex: 50 }], { duration: 240, easing: EASE })
    }
  }

  function onPointerUp(e: PointerEvent) {
    const d = drag.current
    if (!d || e.pointerId !== d.pid) return
    drag.current = null
    const g = gameRef.current
    if (!d.moved) {
      if (!prefsRef.current.tapToMove) return
      const to = bestTarget(g, d.col, d.idx)
      if (to === null) shake(d.els)
      else doMove(d.col, d.idx, to)
      return
    }
    // 松手时压在哪一列上（压得最多的那列），能放就放
    const head = d.els[0].getBoundingClientRect()
    let target = -1, best = 0
    tabRef.current?.querySelectorAll<HTMLElement>('.col').forEach((c, i) => {
      if (!canMove(g, d.col, d.idx, i)) return
      const r = c.getBoundingClientRect()
      const overlap = Math.min(head.right, r.right) - Math.max(head.left, r.left)
      if (overlap > best) { best = overlap; target = i }
    })
    if (target < 0) {
      springBack(d.els)
      return
    }
    flipper.current.capture(d.els)
    release(d.els)
    doMove(d.col, d.idx, target)
  }

  function onPointerCancel(e: PointerEvent) {
    const d = drag.current
    if (!d || e.pointerId !== d.pid) return
    drag.current = null
    springBack(d.els)
  }

  const handlers = useRef({ move: onPointerMove, up: onPointerUp, cancel: onPointerCancel })
  useLayoutEffect(() => { handlers.current = { move: onPointerMove, up: onPointerUp, cancel: onPointerCancel } })
  useEffect(() => {
    const mv = (e: PointerEvent) => handlers.current.move(e)
    const up = (e: PointerEvent) => handlers.current.up(e)
    const cc = (e: PointerEvent) => handlers.current.cancel(e)
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cc)
    return () => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cc)
    }
  }, [])

  /* ---------- 画面 ---------- */
  const { cw } = lay
  const hintMove = hint && 'from' in hint ? hint : null
  const left = dealsLeft(game)

  return (
    <div className="app" ref={appRef} style={{ '--cw': `${cw}px` } as CSSProperties}>
      <GoldDefs />
      <Decor />
      <div className="lace" />

      <header className="brand">
        <div className="logo">
          <span className="s">S<Crown className="tiny-crown" jewel="var(--heart)" /></span>leepy Spider
        </div>
        <div className="sub">
          <i />{game.difficulty === 1 ? '单色' : '双色'}
          <span className="pips">
            <span className="spade"><Pip suit="s" /></span>
            {game.difficulty === 2 && <span className="heart"><Pip suit="h" /></span>}
          </span>
          <i />
        </div>
      </header>

      <section className="hud">
        <Bow className="hud-bow" fill="var(--pink)" />
        <div className="stat"><small>分数</small><b>{game.score}</b></div>
        <div className="sep" />
        <div className="stat"><small>用时</small><Clock running={game.moves > 0 && !isWon(game)} elapsed={elapsed} /></div>
        <div className="sep" />
        <div className="stat"><small>步数</small><b>{game.moves}</b></div>
      </section>

      <section className="toprow">
        <div className="found">
          {Array.from({ length: SETS }, (_, i) => {
            const s = game.done[i]
            return (
              <div key={i} className={s ? `slot done${i === fresh ? ' fresh' : ''}` : 'slot'} data-slot={i}>
                {s && <div className={`mini ${s === 'h' ? 'heart' : 'spade'}`}><b>K</b><Pip suit={s} /></div>}
              </div>
            )
          })}
        </div>
        <div
          ref={stockRef}
          className={`stock${hint && 'deal' in hint ? ' hint' : ''}${left ? '' : ' empty-stock'}`}
          onClick={onStock}
          role="button"
          aria-label={`发牌，还能发 ${left} 次`}
        >
          {Array.from({ length: left }, (_, i) => (
            <CardBack key={i} style={{ left: cw * 0.3 * i }} bow={i === left - 1} stockTop={i === left - 1} />
          ))}
          {left > 0 && <span className="badge">{left}</span>}
        </div>
      </section>

      <main className="tableau" ref={tabRef} onPointerDown={onPointerDown} onContextMenu={(e) => e.preventDefault()}>
        {cw > 0 && game.cols.map((col, c) => {
          const tops = columnTops(col, cw, lay.avail)
          const isTo = hintMove?.to === c
          return (
            <div className="col" key={c}>
              {col.length === 0 && (
                <div className={isTo ? 'empty hint-to' : 'empty'}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={CROWN_PATH} /></svg>
                </div>
              )}
              {col.map((card, i) => {
                let extra: string | undefined
                if (hintMove && hintMove.from === c && i >= hintMove.idx) extra = 'hint'
                else if (isTo && i === col.length - 1) extra = 'hint-to'
                return <CardView key={card.id} card={card} col={c} idx={i} top={tops[i]} extra={extra} />
              })}
            </div>
          )
        })}
      </main>

      <nav className="toolbar">
        <button className="tb" onClick={() => setSheet('settings')}><span className="ic"><IconSettings /></span>设置</button>
        <button className="tb" onClick={onHint}><span className="ic"><IconHint /></span>提示</button>
        <button className="tb primary" onClick={() => setSheet('new')}><span className="ic"><IconCards /></span>新游戏</button>
        <button className="tb" onClick={onUndo} disabled={!history.current.length}><span className="ic"><IconUndo /></span>撤销</button>
        <button className="tb" onClick={() => updatePrefs({ theme: night ? 'day' : 'night' })}>
          <span className="ic">{night ? <IconSun /> : <IconMoon />}</span>{night ? '白天' : '夜晚'}
        </button>
      </nav>

      {toast && <div className="toast" key={toast.id}>{toast.text}</div>}

      {sheet === 'new' && (
        <NewGameSheet
          initial={prefs.difficulty}
          canRestart={game.moves > 0}
          onStart={(d) => startGame(d)}
          onRestart={() => startGame(game.difficulty, game.seed)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'settings' && (
        <SettingsSheet prefs={prefs} onChange={updatePrefs} onClose={() => setSheet(null)} />
      )}
      {win && (
        <WinOverlay
          done={game.done}
          score={game.score}
          time={fmtTime(elapsed.current)}
          moves={game.moves}
          onAgain={() => startGame(prefs.difficulty)}
          onClose={() => setWin(false)}
        />
      )}
    </div>
  )
}
