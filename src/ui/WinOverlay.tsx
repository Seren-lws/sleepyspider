import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Suit } from '../game/engine'
import { rewardText, type Reward } from '../game/progress'
import { Kitten, Petal } from './characters'
import { Konpeito, SPARKLE_PATH } from './icons'

interface Props {
  done: Suit[]
  score: number
  time: string
  moves: number
  rewards: Reward[]
  style: string // win-stars / win-catnap / win-sakura
  preview?: string // 装扮页里"看一看"时，写动画的名字
  onAgain: () => void
  onClose: () => void
}

interface Spot { x: number; y: number }
interface Layout { from: Spot[]; to: Spot[]; w: number; h: number; H: number }

const STAR_COLORS = ['var(--gold)', 'var(--pink-deep)', 'var(--gold-hi)', 'var(--heart)']
const PETAL_COLORS = ['#F4AFC2', '#FAD0DB', '#F7C1CF', '#FBE3EA']

/** 星星飘走：收好的牌化成一团团星星，慢慢往上飘 */
function Stars({ lay, groups }: { lay: Layout; groups: number }) {
  const stars = useMemo(() => Array.from({ length: groups }, (_, i) =>
    Array.from({ length: 7 }, (_, k) => ({
      key: `${i}-${k}`, group: i,
      size: 7 + Math.random() * 12,
      sx: (Math.random() - 0.5) * 120,
      rise: 260 + Math.random() * 260,
      dur: 5 + Math.random() * 3,
      delay: 1.1 + i * 0.16 + k * 0.08 + Math.random() * 0.3,
      color: STAR_COLORS[(i + k) % STAR_COLORS.length],
    })),
  ).flat(), [groups])
  const ambient = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 10,
    dur: 7 + Math.random() * 5,
    delay: 0.8 + Math.random() * 5,
    color: STAR_COLORS[i % STAR_COLORS.length],
  })), [])
  return (
    <>
      {stars.map((s) => (
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
      {ambient.map((s) => (
        <svg key={`a${s.key}`} className="win-star" viewBox="0 0 24 24" aria-hidden="true"
          style={{
            left: `${s.left}%`, top: '100%', width: s.size, height: s.size, color: s.color,
            '--sx': '30px', '--rise': `${-lay.H * 1.05}px`,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          } as CSSProperties}>
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      ))}
    </>
  )
}

/** 小猫睡觉：小白猫在软垫上打个哈欠，躺下，小被子盖上来，冒出 Zzz */
function Catnap() {
  return (
    <div className="catnap">
      <svg className="cushion" viewBox="0 0 180 50" aria-hidden="true">
        <ellipse cx="90" cy="28" rx="86" ry="19" fill="#F0B4C2" />
        <ellipse cx="90" cy="24" rx="84" ry="17" fill="#FADDE4" />
        <ellipse cx="90" cy="22" rx="60" ry="9" fill="#fff" opacity=".35" />
      </svg>
      <div className="cat-sink"><Kitten className="nap-cat" /></div>
      <svg className="blanket" viewBox="0 0 140 58" aria-hidden="true">
        <g fill="#F6B6C6">
          {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={6 + i * 7.6} cy="9" r="4.4" />)}
          <rect x="0" y="9" width="140" height="49" rx="12" />
        </g>
        <path d="M6 16h128" stroke="#fff" strokeWidth="1.4" strokeDasharray="1 5" strokeLinecap="round" />
        <g fill="#fff" opacity=".7">
          {[[24, 32], [56, 40], [88, 30], [118, 42], [40, 50], [102, 52]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y + 3}l-2.6-2.4c-1.3-1.2-1.3-3 .1-3.4 1-.3 1.9.2 2.5 1 .6-.8 1.5-1.3 2.5-1 1.4.4 1.4 2.2.1 3.4z`} />
          ))}
        </g>
      </svg>
      <span className="zzz z1">z</span>
      <span className="zzz z2">z</span>
      <span className="zzz z3">Z</span>
    </div>
  )
}

/** 樱花落：花瓣从上面慢慢飘下来，有一些会停在牌桌上 */
function Sakura({ H }: { H: number }) {
  const petals = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const land = i % 3 === 0
    return {
      key: i,
      left: Math.random() * 100,
      size: 9 + Math.random() * 10,
      x: (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 40),
      rot: 180 + Math.random() * 360,
      end: land ? H * (0.62 + Math.random() * 0.3) : H + 40,
      endop: land ? 0.9 : 0,
      dur: 6 + Math.random() * 4,
      delay: 0.6 + Math.random() * 4.5,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
    }
  }), [H])
  return (
    <>
      {petals.map((p) => (
        <Petal key={p.key} className="petal" color={p.color}
          style={{
            left: `${p.left}%`, width: p.size, height: p.size,
            '--x': `${p.x}px`, '--end': `${p.end}px`, '--rot': `${p.rot}deg`, '--endop': p.endop,
            animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
          } as CSSProperties} />
      ))}
    </>
  )
}

/** 赢了：收好的 8 串牌先飘到中间，然后按选好的胜利动画演一段 */
export function WinOverlay({ done, score, time, moves, rewards, style, preview, onAgain, onClose }: Props) {
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
    setLay({ from, to, w, h, H: base.height })
  }, [done])

  return (
    <div ref={ref} className={`win style-${style}${skip ? ' skip' : ''}`} onClick={() => setSkip(true)}>
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
      {lay && style === 'win-stars' && <Stars lay={lay} groups={done.length} />}
      {lay && style === 'win-catnap' && <Catnap />}
      {lay && style === 'win-sakura' && <Sakura H={lay.H} />}

      <div className="win-panel" onClick={(e) => e.stopPropagation()}>
        <div className="win-title">Sweet dreams</div>
        {preview ? (
          <>
            <div className="win-sub">胜利动画预览：{preview}</div>
            <button className="btn primary" onClick={onClose}>好啦</button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
