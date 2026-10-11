import type { ReactNode } from 'react'
import type { Suit } from '../game/engine'

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
const SPADE = 'M12 2C9 6 3 9.5 3 14c0 2.5 2 4.5 4.5 4.5 1.4 0 2.6-.6 3.4-1.5-.3 1.8-1 3.3-2.4 4.5h7c-1.4-1.2-2.1-2.7-2.4-4.5.8.9 2 1.5 3.4 1.5 2.5 0 4.5-2 4.5-4.5C21 9.5 15 6 12 2z'
export const CROWN_PATH = 'M3.5 17.5 2.5 8l5 4 4.5-7 4.5 7 5-4-1 9.5z'

export function Pip({ suit, className }: { suit: Suit; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={suit === 'h' ? HEART : SPADE} />
    </svg>
  )
}

const gold = { fill: 'url(#gold)', style: { stroke: 'var(--gold-deep)' }, strokeWidth: 0.8, strokeLinejoin: 'round' as const }

/** J 星星、Q 头冠、K 皇冠；宝石颜色跟着花色走 */
export function FaceArt({ rank }: { rank: number }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      {rank === 13 && (
        <>
          <path d={CROWN_PATH} {...gold} />
          <rect x="3.5" y="18.6" width="17" height="2.2" rx="1.1" {...gold} />
          <circle cx="12" cy="4.4" r="1.4" fill="currentColor" />
          <circle cx="2.6" cy="7.4" r="1.1" fill="currentColor" />
          <circle cx="21.4" cy="7.4" r="1.1" fill="currentColor" />
        </>
      )}
      {rank === 12 && (
        <>
          <path d="M3 18c2.5-1.6 5.6-2.4 9-2.4s6.5.8 9 2.4l-1.2-7.5-3.6 3L12 6.5l-4.2 7-3.6-3z" {...gold} />
          <circle cx="12" cy="4.8" r="1.6" fill="currentColor" />
          <circle cx="12" cy="13.4" r="1.3" fill="currentColor" />
        </>
      )}
      {rank === 11 && (
        <>
          <path d="M12 3l2.3 5.4 5.8.5-4.4 3.8 1.3 5.7L12 15.4 7 18.4l1.3-5.7L3.9 8.9l5.8-.5z" {...gold} />
          <circle cx="12" cy="11.4" r="1.6" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export function Crown({ className, jewel = 'currentColor' }: { className?: string; jewel?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d={CROWN_PATH} {...gold} />
      <rect x="3.5" y="18.6" width="17" height="2.2" rx="1.1" {...gold} />
      <circle cx="12" cy="4.4" r="1.4" fill={jewel} />
      <circle cx="2.6" cy="7.4" r="1.1" fill={jewel} />
      <circle cx="21.4" cy="7.4" r="1.1" fill={jewel} />
    </svg>
  )
}

export function Bow({ className, fill }: { className?: string; fill: string }) {
  return (
    <svg className={className} viewBox="0 0 40 26" aria-hidden="true">
      <g style={{ fill, stroke: 'var(--gold)' }} strokeWidth=".9" strokeLinejoin="round">
        <path d="M18.5 12.5 13 24l3.5-1.4 2.1 2.4 1.9-12z" />
        <path d="M21.5 12.5 27 24l-3.5-1.4-2.1 2.4-1.9-12z" />
        <path d="M20 11C15 3 5 1 3.5 6.5 2 12 11 15 20 11z" />
        <path d="M20 11c5-8 15-10 16.5-4.5C38 12 29 15 20 11z" />
        <ellipse cx="20" cy="11.3" rx="3.2" ry="3.6" />
      </g>
    </svg>
  )
}

export const SPARKLE_PATH = 'M12 0c.8 6 5.2 10.4 12 12-6.8 1.6-11.2 6-12 12-.8-6-5.2-10.4-12-12C6.8 10.4 11.2 6 12 0z'

/** 页面里共用的金色渐变 */
export function GoldDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--gold-hi)' }} />
          <stop offset=".55" style={{ stopColor: 'var(--gold)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gold-deep)' }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ---- 底部按钮的线条小图标 ---- */
const Line = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
)
export const IconSettings = () => (
  <Line><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></Line>
)
export const IconHint = () => (
  <Line><path d="M4.5 19.5 14 10" /><path d="M16.5 3.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" /><path d="M8 5v2M7 6h2M19 15v2M18 16h2" /></Line>
)
export const IconCards = () => (
  <Line>
    <rect x="4.5" y="5.5" width="10" height="14" rx="2" transform="rotate(-9 9.5 12.5)" />
    <rect x="9.5" y="4.5" width="10" height="14" rx="2" transform="rotate(9 14.5 11.5)" />
    <path d="M14.6 9.6l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
  </Line>
)
export const IconUndo = () => (
  <Line><path d="M9 6 4 11l5 5" /><path d="M4 11h10.5a5 5 0 0 1 0 10H11" /></Line>
)
export const IconMoon = () => (
  <Line><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></Line>
)
export const IconSun = () => (
  <Line>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Line>
)

/* ---- 金平糖：一颗圆圆的、带小疙瘩的星星糖 ---- */
const BUMPS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2
  return [12 + Math.cos(a) * 6.4, 12 + Math.sin(a) * 6.4] as const
})
export const CANDY_COLORS = ['#F6A8BC', '#F7D58A', '#C9B6E8', '#A9DCC8']

export function Konpeito({ className, color = CANDY_COLORS[0] }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <g fill={color} stroke="rgba(120,80,90,.25)" strokeWidth=".5">
        {BUMPS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" />)}
        <circle cx="12" cy="12" r="6.8" stroke="none" />
      </g>
      <circle cx="9.6" cy="9.2" r="1.9" fill="#fff" opacity=".8" />
    </svg>
  )
}

export const IconLock = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="lock">
    <rect x="5.5" y="10.5" width="13" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" />
  </svg>
)

export const IconCheck = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="check"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)

/** 成就小奖章：拿到了是金色，没拿到是灰灰的轮廓 */
export function Medal({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={on ? 'medal on' : 'medal'}>
      <path d="M8 2.5h3l1.8 5.5H9.8zM16 2.5h-3l-1.8 5.5h3z" className="ribbon" />
      <circle cx="12" cy="15" r="6.5" className="coin" />
      <path d="M12 11.3l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" className="star" />
    </svg>
  )
}
