import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Suit } from '../game/engine'
import { rewardText, type Reward } from '../game/progress'
import { Konpeito, SPARKLE_PATH } from './icons'

interface Props {
  done: Suit[]
  score: number
  time: string
  moves: number
  rewards: Reward[]
  onAgain: () => void
  onClose: () => void
}

interface Spot { x: number; y: number }
interface Layout { from: Spot[]; to: Spot[]; w: number; h: number }

const STAR_COLORS = ['var(--gold)', 'var(--pink-deep)', 'var(--gold-hi)', 'var(--heart)']

/** 赢了：收好的 8 串牌飘到中间，一串一串化成星星，慢慢飘上去 */
export function WinOverlay({ done, score, time, moves, rewards, onAgain, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [lay, setLay] = useState<Layout | null>(null)
  const [skip, setSkip] = useState(false)

  // 量一下左上角 8 个格子现在在哪，牌就从那里出发，飘到画面中间排成一排
  useLayoutEffect(() => {
    const root = ref.current?.parentElement
    if (!root) return
    const base = root.getBoundingClientRect()
    const gap = Math.min(44, base.width / 9)
    let w = 26, h = 37
    const from = done.map((_, i) => {
      const r = root.querySelector(`[data-slot="${i}"]`)?.getBoundingClientRect()
      if (!r) return { x: 20 + i * 30, y: 120 }
      w = r.width
      h = r.height
      return { x: r.left - base.left, y: r.top - base.top }
    })
    const to = done.map((_, i) => ({ x: base.width / 2 + (i - (done.length - 1) / 2) * gap, y: base.height * 0.46 }))
    setLay({ from, to, w, h })
  }, [done])

  const stars = useMemo(() => done.flatMap((_, i) =>
    Array.from({ length: 7 }, (_, k) => ({
      key: `${i}-${k}`,
      group: i,
      size: 7 + Math.random() * 12,
      sx: (Math.random() - 0.5) * 120,
      rise: 260 + Math.random() * 260,
      dur: 5 + Math.random() * 3,
      delay: 1.1 + i * 0.16 + k * 0.08 + Math.random() * 0.3,
      color: STAR_COLORS[(i + k) % STAR_COLORS.length],
    })),
  ), [done])

  const ambient = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 10,
    dur: 7 + Math.random() * 5,
    delay: 0.8 + Math.random() * 5,
    color: STAR_COLORS[i % STAR_COLORS.length],
  })), [])

  return (
    <div ref={ref} className={skip ? 'win skip' : 'win'} onClick={() => setSkip(true)}>
      {lay && done.map((suit, i) => (
        <div
          key={i}
          className={`win-mini ${suit === 'h' ? 'heart' : 'spade'}`}
          style={{
            left: lay.from[i].x, top: lay.from[i].y, width: lay.w, height: lay.h,
            '--tx': `${lay.to[i].x - lay.w / 2 - lay.from[i].x}px`,
            '--ty': `${lay.to[i].y - lay.h / 2 - lay.from[i].y}px`,
            animationDelay: `${0.15 + i * 0.09}s, ${1 + i * 0.16}s`,
          } as CSSProperties}
        >
          <b>K</b>
        </div>
      ))}
      {lay && stars.map((s) => (
        <svg key={s.key} className="win-star" viewBox="0 0 24 24" aria-hidden="true"
          style={{
            left: lay.to[s.group].x - s.size / 2, top: lay.to[s.group].y - s.size / 2,
            width: s.size, height: s.size, color: s.color,
            '--sx': `${s.sx}px`, '--rise': `${-s.rise}px`,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          } as CSSProperties}>
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      ))}
      {lay && ambient.map((s) => (
        <svg key={`a${s.key}`} className="win-star" viewBox="0 0 24 24" aria-hidden="true"
          style={{
            left: `${s.left}%`, top: '100%', width: s.size, height: s.size, color: s.color,
            '--sx': '30px', '--rise': `${-(lay.to[0]?.y ?? 400) * 2.3}px`,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          } as CSSProperties}>
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      ))}

      <div className="win-panel" onClick={(e) => e.stopPropagation()}>
        <div className="win-title">Sweet dreams</div>
        <div className="win-sub">这一局赢啦</div>
        <div className="win-stats">
          <div><small>分数</small><b>{score}</b></div>
          <div><small>用时</small><b>{time}</b></div>
          <div><small>步数</small><b>{moves}</b></div>
        </div>
        {rewards.some((r) => r.kind !== 'set') && (
          <ul className="win-rewards">
            {rewards.filter((r) => r.kind !== 'set' && r.kind !== 'level').map((r, i) => (
              <li key={i}><Konpeito className="k" />{rewardText(r)}</li>
            ))}
            {rewards.filter((r) => r.kind === 'level').slice(-1).map((r) => (
              <li key="lv" className="lv">🎁 {rewardText(r)}，有一份礼物等你拆</li>
            ))}
          </ul>
        )}
        <button className="btn primary" onClick={onAgain}>再来一局</button>
        <button className="btn text" onClick={onClose}>看看牌桌</button>
      </div>
    </div>
  )
}
